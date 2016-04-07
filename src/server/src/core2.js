import _ from 'lodash';
import { List, Map, fromJS } from 'immutable';
import naturalSort from 'javascript-natural-sort';
import moment from 'moment';
import * as Amount from './amount.js';
import * as PlaceholderMap from './PlaceholderMap.js';

export const INITIAL_STATE = Map();

/*
 * Transaction
 * - date: string - ISO datetime
 * - id: string - an optional unique ID
 * - description: string - optional
 * - details: string - optional additional details for personal notes
 * - tags: object - optional Tags map from tag to value
 * - accounts: IndirectMap - an IndirectMap from account name to array of AccountEntry
 *
 * AccountEntry:
 * - amount: Amount
 * - tags: Tags map, string -> any
 */
export function mergeTransaction(state, basename, entryId, t) {
	entryId = entryId.toString();
	state = state.mergeDeepIn(["transactions", basename, entryId], fromJS(t));

	const phase = _.get(t, "transactionType", "unadjusted");
	iterateAccounts(t.accounts, (accountName, accountEntry) => {
		const amount = accountEntry.amount || 0;

		// Add transaction to accountEntries
		state = state.updateIn(["accountEntries", accountName, phase, "entries", entryId], 0, n => Amount.add(n, amount));
		state = state.updateIn(["accountEntries", accountName, phase, "sum"], 0, n => Amount.add(n, amount));
		const sumInOut = (amount < 0) ? "sumOut" : "sumIn";
		state = state.updateIn(["accountEntries", accountName, phase, sumInOut], 0, n => Amount.add(n, amount));

		/*// Add cash transaction to cashTransactionEntries
		const cashActivity = _.get(accountEntry, ["tags", "reports/cash/activity"]);
		if (cashActivity) {
			state = state.updateIn(["reports", "cash"], List(), l => {
				return l.push(fromJS(_.merge({}, {date: t.date, id: t.id, cash: amount, [cashActivity]: amount})));
			});
		}*/
	});

	state = addTransactionToReportCash(state, t);
	state = addTransactionToReportIncome(state, t);
	state = addTransactionToReportBalance(state, t);
	state = addTransactionToReportCashflow(state, t);
	state = updateClosingTransactions(state, t);

	return state;
}

function iterateAccounts(accounts, fn) {
	const l = PlaceholderMap.toPairs(accounts);
	l.forEach(([accountName, accountEntries]) => {
		accountEntries.forEach(accountEntry => fn(accountName, accountEntry));
	});
}

function addTransactionToReportCash(state, t) {
	const date0 = _.get(t, ["tags", "report/cash/date"], t.date);

	iterateAccounts(t.accounts, (accountName, accountEntry) => {
		const amount = accountEntry.amount || 0;

		const cashActivity = _.get(accountEntry, ["tags", "reports/cash/activity"]);
		const date = _.get(accountEntry, ["tags", "report/cash/date"], date0);
		// Add cash transaction to cashTransactionEntries
		if (cashActivity && date) {
			const period = moment(date, "YYYY-MM-DD").year().toString();
			state = state.updateIn(["reports", "cash", period], List(), l => {
				return l.push(fromJS(_.merge({}, {date: t.date, id: t.id, cash: amount, [cashActivity]: amount})));
			});
		}
	});

	return state;
}

function addTransactionToReportIncome(state, t) {
	const date0 = _.get(t, ["tags", "report/income/date"], t.date);
	// console.log({tdate: t.date, date0})

	iterateAccounts(t.accounts, (accountName, accountEntry) => {
		const amount = accountEntry.amount || 0;
		const date = _.get(accountEntry, ["tags", "report/income/date"], date0);
		// console.log({amount, date})
		if (!amount || !date) {
			return;
		}

		const period = moment(date, "YYYY-MM-DD").year().toString();
		let report = state.getIn(["reports", "income", period], Map());
		const accountPath = accountName.split(":");
		// console.log({accountPath})
		if (_.isEqual(["revenues", "primary"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["revenues", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["revenues", "total"], 0, n => Amount.subtract(n, amount));
		}
		else if (_.isEqual(["expenses", "primary"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["costOfRevenues", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["costOfRevenues", "total"], 0, n => Amount.subtract(n, amount));
		}
		else if (_.isEqual(["expenses", "period"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["periodExpenses", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["periodExpenses", "total"], 0, n => Amount.subtract(n, amount));
		}
		else if (_.isEqual(["revenues", "secondary"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["secondaryGains", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["secondaryGains", "total"], 0, n => Amount.subtract(n, amount));
		}
		else if (_.isEqual(["expenses", "secondary"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["secondaryLosses", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["secondaryLosses", "total"], 0, n => Amount.subtract(n, amount));
		}
		else if (_.isEqual(["expenses", "income tax"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["incomeTax", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["incomeTax", "total"], 0, n => Amount.subtract(n, amount));
		}

		state = state.setIn(["reports", "income", period], report);
	});

	return state;
}

function addTransactionToReportBalance(state, t) {
	const date0 = _.get(t, ["tags", "report/income/date"], t.date);
	// console.log({tdate: t.date, date0})

	iterateAccounts(t.accounts, (accountName, accountEntry) => {
		const amount = accountEntry.amount || 0;
		const date = _.get(accountEntry, ["tags", "report/income/date"], date0);
		// console.log({amount, date})
		if (!amount || !date) {
			return;
		}

		const period = moment(date, "YYYY-MM-DD").year().toString();
		let report = state.getIn(["reports", "balance", period], Map());
		const accountPath = accountName.split(":");
		// console.log({accountPath})

		// Assets
		if (_.isEqual(["assets", "current"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["assetsCurrent", "accounts", accountName2], 0, n => Amount.add(n, amount))
				.updateIn(["assetsCurrent", "total"], 0, n => Amount.add(n, amount))
				.updateIn(["debitsTotal", "total"], 0, n => Amount.add(n, amount));
		}
		else if (_.isEqual(["assets", "long-term"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["assetsLongterm", "accounts", accountName2], 0, n => Amount.add(n, amount))
				.updateIn(["assetsLongterm", "total"], 0, n => Amount.add(n, amount))
				.updateIn(["debitsTotal", "total"], 0, n => Amount.add(n, amount));
		}
		else if (_.isEqual(["assets", "intangible"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["assetsIntangible", "accounts", accountName2], 0, n => Amount.add(n, amount))
				.updateIn(["assetsIntangible", "total"], 0, n => Amount.add(n, amount))
				.updateIn(["debitsTotal", "total"], 0, n => Amount.add(n, amount));
		}

		// Liabilities
		else if (_.isEqual(["liabilities", "current"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["liabilitiesCurrent", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["liabilitiesCurrent", "total"], 0, n => Amount.subtract(n, amount))
				.updateIn(["liabilitiesTotal", "total"], 0, n => Amount.subtract(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => Amount.subtract(n, amount));
		}
		else if (_.isEqual(["liabilities", "long-term"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["liabilitiesLongterm", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["liabilitiesLongterm", "total"], 0, n => Amount.subtract(n, amount))
				.updateIn(["liabilitiesTotal", "total"], 0, n => Amount.subtract(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => Amount.subtract(n, amount));
		}

		// Liabilities
		else if (_.isEqual(["equity"], _.take(accountPath, 1))) {
			const accountName2 = _.drop(accountPath, 1).join(":") || "general";
			report = report
				.updateIn(["equity", "accounts", accountName2], 0, n => Amount.subtract(n, amount))
				.updateIn(["equity", "total"], 0, n => Amount.subtract(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => Amount.subtract(n, amount));
		}

		state = state.setIn(["reports", "balance", period], report);
	});

	return state;
}

function addTransactionToReportCashflow(state, t) {
	const date0 = _.get(t, ["tags", "report/cash/date"], t.date);

	iterateAccounts(t.accounts, (accountName, accountEntry) => {
		const amount = accountEntry.amount || 0;

		const cashActivity = _.get(accountEntry, ["tags", "reports/cash/activity"]);
		const date = _.get(accountEntry, ["tags", "report/cash/date"], date0);
		// Add cash transaction to cashTransactionEntries
		if (cashActivity && date) {
			const period = moment(date, "YYYY-MM-DD").year().toString();

			state = state.updateIn(["reports", "cashflow", period, cashActivity], Map(), m => {
				return m.updateIn(
						["transactions"],
						List(),
						l => l.push(Map({id: t.id, description: t.description, amount}))
					).updateIn(
						["total"],
						0,
						n => n += amount
					);
			});
		}
	});

	return state;
}

function updateClosingTransactions(state, t) {
	const date0 = _.get(t, ["tags", "report/income/date"], t.date);
	// console.log({tdate: t.date, date0})

	iterateAccounts(t.accounts, (accountName, accountEntry) => {
		const amount = accountEntry.amount || 0;
		const date = _.get(accountEntry, ["tags", "report/income/date"], date0);
		// console.log({amount, date})
		if (!amount || !date) {
			return;
		}

		const period = moment(date, "YYYY-MM-DD").year().toString();
		let report = state.getIn(["reports", "balance", period], Map());
		const accountPath = accountName.split(":");
		// Date for end of period/year
		const dateClosing = moment(`${period+1}-01-01`, "YYYY-MM-DD").subtract(1, 'day').format('YYYY-MM-DD');
		// console.log({accountPath})

		const isRevenue = _.isEqual(["revenues"], _.take(accountPath, 1));
		const isExpense = _.isEqual(["expenses"], _.take(accountPath, 1));
		// Generate closing transaction C1, which closes out all revenues to Retained Earnings
		if (isRevenue) {
			const accountName2 = _.drop(accountPath, 1).join(":") || "general";
			const pathC1 = ["transactions", "AUTOMATIC", "C1_"+period];
			let c1 = state.getIn(pathC1, Map({
				transactionType: "closing",
				description: "Revenues to Retained Earnings",
				date: dateClosing,
				accounts: Map()
			}));
			c1 = c1.updateIn(["accounts", accountName], List(), l => l.push(Map({"amount": -amount})));
			c1 = c1.updateIn(["accounts", "equity:retained earnings"], List(), l => l.push(Map({"amount": amount})));
			// console.log("C1: "+c1)
			state = state.setIn(pathC1, c1);
		}

		// Generate closing transaction C2, which closes out all expenses to Retained Earnings
		if (isExpense) {
			const accountName2 = _.drop(accountPath, 1).join(":") || "general";
			const pathC1 = ["transactions", "AUTOMATIC", "C2_"+period];
			let c1 = state.getIn(pathC1, Map({
				transactionType: "closing",
				description: "Expenses to Retained Earnings",
				date: dateClosing,
				accounts: Map()
			}));
			c1 = c1.updateIn(["accounts", accountName], List(), l => l.push(Map({"amount": -amount})));
			c1 = c1.updateIn(["accounts", "equity:retained earnings"], List(), l => l.push(Map({"amount": amount})));
			// console.log("C2: "+c1)
			state = state.setIn(pathC1, c1);
		}

		// Update equity balance
		if (isRevenue || isExpense) {
			report = report
				.updateIn(["equity", "accounts", "retained earnings"], 0, n => Amount.subtract(n, amount))
				.updateIn(["equity", "total"], 0, n => Amount.subtract(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => Amount.subtract(n, amount));
				state = state.setIn(["reports", "balance", period], report);
		}
	});

	return state;
}
