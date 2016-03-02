import _ from 'lodash';
import { List, Map } from 'immutable';

export const INITIAL_STATE = Map();

export function mergeTransaction(state, basename, entryId, t) {
	state = state.mergeDeepIn(["transactions", basename, entryId.toString()], t);

	const phase = _.get(t, "phase", "unadjusted");
	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;

			// Add transaction to accountEntries
			state = state.updateIn(["accountEntries", accountName, phase, "entries"], Map(), m => m.set(entryId, amount));
			state = state.updateIn(["accountEntries", accountName, phase, "sum"], 0, n => n + amount);
			const sumInOut = (amount < 0) ? "sumOut" : "sumIn";
			state = state.updateIn(["accountEntries", accountName, phase, sumInOut], 0, n => n + amount);

			// Add cash transaction to cashTransactionEntries

		});
	});

	return state;
}
