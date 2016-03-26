import _ from 'lodash';
import { List, Map, fromJS } from 'immutable';
import naturalSort from 'javascript-natural-sort';
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

	const phase = _.get(t, "transactionType", "unadjusted");
	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;

			// Add transaction to accountEntries
			state = state.updateIn(["accountEntries", accountName, phase, "entries", entryId], 0, n => n + amount);
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
	state = addTransactionToReportIncome(state, t);
	state = addTransactionToReportBalance(state, t);

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

function addTransactionToReportIncome(state, t) {
	const date0 = _.get(t, ["tags", "report/income/date"], t.date);
	// console.log({tdate: t.date, date0})

	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;
			const date = _.get(accountEntry, ["tags", "report/income/date"], date0);
			// console.log({amount, date})
			if (!amount || !date) {
				return;
			}

			const period = moment(date).year().toString();
			let report = state.getIn(["reports", "income", period], Map());
			const accountPath = accountName.split(":");
			// console.log({accountPath})
			if (_.isEqual(["revenues", "primary"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["revenues", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["revenues", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["expenses", "primary"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["costOfRevenues", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["costOfRevenues", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["expenses", "period"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["periodExpenses", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["periodExpenses", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["revenues", "secondary"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["secondaryGains", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["secondaryGains", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["expenses", "secondary"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["secondaryLosses", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["secondaryLosses", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["expenses", "income tax"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["incomeTax", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["incomeTax", "total"], 0, n => n + -amount);
			}

			state = state.setIn(["reports", "income", period], report);
		});
	});

	return state;
}

function addTransactionToReportBalance(state, t) {
	const date0 = _.get(t, ["tags", "report/income/date"], t.date);
	// console.log({tdate: t.date, date0})

	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;
			const date = _.get(accountEntry, ["tags", "report/income/date"], date0);
			// console.log({amount, date})
			if (!amount || !date) {
				return;
			}

			const period = moment(date).year().toString();
			let report = state.getIn(["reports", "balance", period], Map());
			const accountPath = accountName.split(":");
			// console.log({accountPath})

			// Assets
			if (_.isEqual(["assets", "current"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["assetsCurrent", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["assetsCurrent", "total"], 0, n => n + -amount)
					.updateIn(["debitsTotal", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["assets", "long-term"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["assetsLongterm", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["assetsLongterm", "total"], 0, n => n + -amount)
					.updateIn(["debitsTotal", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["assets", "intangible"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["assetsIntangible", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["assetsIntangible", "total"], 0, n => n + -amount)
					.updateIn(["debitsTotal", "total"], 0, n => n + -amount);
			}

			// Liabilities
			else if (_.isEqual(["liabilities", "current"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["liabilitiesCurrent", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["liabilitiesCurrent", "total"], 0, n => n + -amount)
					.updateIn(["liabilitiesTotal", "total"], 0, n => n + -amount)
					.updateIn(["creditsTotal", "total"], 0, n => n + -amount);
			}
			else if (_.isEqual(["liabilities", "long-term"], _.take(accountPath, 2))) {
				const accountName2 = _.drop(accountPath, 2).join(":") || "general";
				report = report
					.updateIn(["liabilitiesLongterm", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["liabilitiesLongterm", "total"], 0, n => n + -amount)
					.updateIn(["liabilitiesTotal", "total"], 0, n => n + -amount)
					.updateIn(["creditsTotal", "total"], 0, n => n + -amount);
			}

			// Liabilities
			else if (_.isEqual(["equity"], _.take(accountPath, 1))) {
				const accountName2 = _.drop(accountPath, 1).join(":") || "general";
				report = report
					.updateIn(["equity", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["equity", "total"], 0, n => n + -amount)
					.updateIn(["creditsTotal", "total"], 0, n => n + -amount);
			}

			state = state.setIn(["reports", "balance", period], report);
		});
	});

	return state;
}

function updateClosingTransactions(state, t) {
	const date0 = _.get(t, ["tags", "report/income/date"], t.date);
	// console.log({tdate: t.date, date0})

	_.forEach(t.accounts, (accountEntries, accountName) => {
		_.forEach(accountEntries, accountEntry => {
			const amount = accountEntry.amount || 0;
			const date = _.get(accountEntry, ["tags", "report/income/date"], date0);
			// console.log({amount, date})
			if (!amount || !date) {
				return;
			}

			const period = moment(date).year().toString();
			let report = state.getIn(["reports", "balance", period], Map());
			const accountPath = accountName.split(":");
			// console.log({accountPath})

			// Assets
			if (_.isEqual(["revenues"], _.take(accountPath, 1))) {
				const accountName2 = _.drop(accountPath, 1).join(":") || "general";
				CONTINUE (see `c1 = ` below)
				report = report
					.updateIn(["assetsCurrent", "accounts", accountName2], 0, n => n + -amount)
					.updateIn(["assetsCurrent", "total"], 0, n => n + -amount)
					.updateIn(["debitsTotal", "total"], 0, n => n + -amount);
			}


	// Generate closing transaction C1, which closes out all revenues to Retained Earnings
	const c1 = (() => {
		const expenses = _(taccounts).keys().filter(s => _.startsWith(s, "revenues")).sortBy(_.identity).value();
		//console.log(JSON.stringify(expenses))
		const pairs = expenses.map(key => [key, [{amount: -taccounts[key].sum}]]);
		//_.forEach(pairs, x => {console.log(x)});
		const sumExpenses = _.reduce(pairs, (acc, x) => acc + x[1][0].amount, 0);
		const accounts = _.fromPairs(
			[["equity:retained earnings", [{amount: -sumExpenses}]]].concat(pairs)
		);
		//console.log(JSON.stringify({accounts}, null, '\t'))
		//_.forEach(s => console.log(s));
		return {
			"phase": "closing",
			description: "Revenues to Retained Earnings",
			date: "2012-12-31",
			accounts
		};
	})();

	const c2 = (() => {
		// Generate closing transaction C2, which closes out all expenses to Retained Earnings
		const expenses = _(taccounts).keys().filter(s => _.startsWith(s, "expenses")).sortBy(_.identity).value();
		//console.log(JSON.stringify(expenses))
		const pairs = expenses.map(key => [key, [{amount: -taccounts[key].sum}]]);
		//_.forEach(pairs, x => {console.log(x)});
		const sumExpenses = _.reduce(pairs, (acc, x) => acc + x[1][0].amount, 0);
		const accounts = _.fromPairs(
			[["equity:retained earnings", [{amount: -sumExpenses}]]].concat(pairs)
		);
		//console.log(JSON.stringify({accounts}, null, '\t'))
		//_.forEach(s => console.log(s));
		return {
			"phase": "closing",
			description: "Expenses to Retained Earnings",
			date: "2012-12-31",
			accounts
		};
	})();
	//console.log(JSON.stringify(c2, null, '\t'))

	return _.merge({}, transactions, {"C1": c1, "C2": c2});
}
