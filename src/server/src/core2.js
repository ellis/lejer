import _ from 'lodash';
import { List, Map, fromJS } from 'immutable';
import moment from 'moment';

export const INITIAL_STATE = Map();

/*
 * Transaction
 * - date: string - ISO datetime
 * - id: string - an optional unique ID
 * - description: string - optional
 * - details: string - optional additional details for personal notes
 * - tags: object - optional Tags map from tag to value
 * - accounts: object - Map from account name to AccountEntry
 *
 * AccountEntry:
 * - amount: Amount
 * - tags: Tags map, string -> any
 */
export function mergeTransaction(state, basename, entryId, t) {
	entryId = entryId.toString();
	state = state.mergeDeepIn(["transactions", basename, entryId], fromJS(t));

	const phase = _.get(t, "phase", "unadjusted");
	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;

			// Add transaction to accountEntries
			state = state.updateIn(["accountEntries", accountName, phase, "entries"], Map(), m => m.set(entryId, amount));
			state = state.updateIn(["accountEntries", accountName, phase, "sum"], 0, n => n + amount);
			const sumInOut = (amount < 0) ? "sumOut" : "sumIn";
			state = state.updateIn(["accountEntries", accountName, phase, sumInOut], 0, n => n + amount);

			/*// Add cash transaction to cashTransactionEntries
			const cashActivity = _.get(accountEntry, ["tags", "reports/cash/activity"]);
			if (cashActivity) {
				state = state.updateIn(["reports", "cash"], List(), l => {
					return l.push(fromJS(_.merge({}, {date: t.date, id: t.id, cash: amount, [cashActivity]: amount})));
				});
			}*/
		});
	});

	state = addTransactionToReportCash(state, t);

	return state;
}

function addTransactionToReportCash(state, t) {
	const date0 = _.get(t, ["tags", "report/cash/date"], t.date);

	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;

			const cashActivity = _.get(accountEntry, ["tags", "reports/cash/activity"]);
			const date = _.get(accountEntry, ["tags", "report/cash/date"], date0);
			// Add cash transaction to cashTransactionEntries
			if (cashActivity && date) {
				const period = moment(date).year().toString();
				state = state.updateIn(["reports", "cash", period], List(), l => {
					return l.push(fromJS(_.merge({}, {date: t.date, id: t.id, cash: amount, [cashActivity]: amount})));
				});
			}
		});
	});

	return state;
}
