import { List, Map } from 'immutable';

export const INITIAL_STATE = Map();

export function mergeTransaction(state, basename, entryId, t) {
	state = state.mergeDeepIn(["transactions", basename, entryId.toString()], t);
	return state;
}

function x() {
	const tPhase = _.get(accountingPhases, t.phase, 0);
	const phase = _.get(t, "phase", "unadjusted");
	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;

			// Add transaction to accountEntries
			this.state = this.state.updateIn(["accountEntries", accountName, phase, "entries"], Map(), m => m.set(id, amount));
			this.state = this.state.updateIn(["accountEntries", accountName, phase, "sum"], 0, n => n + amount);
			const sumInOut = (amount < 0) ? "sumOut" : "sumIn";
			this.state = this.state.updateIn(["accountEntries", accountName, phase, sumInOut], 0, n => n + amount);

			// Add cash transaction to cashTransactionEntries

		});
	});

}
export function setEntries(state, entries) {
	const list = List(entries);
	return state.set('entries', list).set('initialEntries', list);
}

function getWinners(vote) {
	if (!vote) return [];
	const [one, two] = vote.get('pair');
	const oneVotes = vote.getIn(['tally', one], 0);
	const twoVotes = vote.getIn(['tally', two], 0);
	if (oneVotes > twoVotes) return [one];
	else if (oneVotes < twoVotes) return [two];
	else return [one, two];
}

export function next(state, round = state.getIn(['vote', 'round'], 0)) {
	const entries = state.get('entries')
		.concat(getWinners(state.get('vote')));
	if (entries.size === 1) {
		return state.remove('vote')
			.remove('entries')
			.set('winner', entries.first());
	} else {
		return state.merge({
			vote: Map({
				round: round + 1,
				pair: entries.take(2)
			}),
			entries: entries.skip(2)
		});
	}
}

export function restart(state) {
	const round = state.getIn(['vote', 'round'], 0);
	return next(
		state.set('entries', state.get('initialEntries'))
		.remove('vote')
		.remove('winner'),
		round
	);
}

function removePreviousVote(voteState, voter) {
	const previousVote = voteState.getIn(['votes', voter]);
	if (previousVote) {
		return voteState.updateIn(['tally', previousVote], t => t - 1)
			.removeIn(['votes', voter]);
	} else {
		return voteState;
	}
}

function addVote(voteState, entry, voter) {
	if (voteState.get('pair').includes(entry)) {
		return voteState.updateIn(['tally', entry], 0, t => t + 1)
			.setIn(['votes', voter], entry);
	} else {
		return voteState;
	}
}

export function vote(voteState, entry, voter) {
	return addVote(
		removePreviousVote(voteState, voter),
		entry,
		voter
	);
}
