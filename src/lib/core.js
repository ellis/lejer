import _ from 'lodash';
import { List, Map, fromJS } from 'immutable';
import naturalSort from 'javascript-natural-sort';
import moment from 'moment';
import * as Amount from './Amount.js';
import * as PlaceholderMap from './PlaceholderMap.js';

export const INITIAL_STATE = Map();
Error.stackTraceLimit = Infinity;

/**
 * Add an immutable amount to a mutable amount object.
 * @param {[type]} a [description]
 * @param {[type]} b [description]
 * @return return an Immutable Amount
 */
function addAmountsIM(a, b) {
	if (!_.isNumber(a))
		a = a.toJS();
	const c = Amount.add(a, b);
	return fromJS(c);
}

function subtractAmountsIM(a, b) {
	if (!_.isNumber(a))
		a = a.toJS();
	const c = Amount.subtract(a, b);
	return fromJS(c);
}

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
export function mergeTransaction(state, basename, index, t) {
	// console.log("mergeTransaction: "+JSON.stringify({state, basename, entryId, t}))
	index = index.toString();
	fillMissingAmount(t.accounts);
	const id = t.id.toString();
	state = state.mergeDeepIn(["transactions", basename, index], fromJS(t));

	const phase = _.get(t, "transactionType", "unadjusted");
	iterateAccounts(t.accounts, (accountName, accountEntry) => {
		const amount = accountEntry.amount || 0;

		// Add transaction to accountEntries
		state = state.updateIn(["accountEntries", accountName, phase, "entries", id], 0, n => addAmountsIM(n, amount));
		state = state.updateIn(["accountEntries", accountName, phase, "sum"], 0, n => addAmountsIM(n, amount));
		const sumInOut = (Amount.compareToZero(amount) < 0) ? "sumOut" : "sumIn";
		state = state.updateIn(["accountEntries", accountName, phase, sumInOut], 0, n => addAmountsIM(n, amount));

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

function fillMissingAmount(accounts) {
	const l = PlaceholderMap.toPairsWithPaths(accounts);
	// console.log({l})
	let last = undefined;
	let lastAmount = 0;
	// console.log({accounts})
	l.forEach(([accountPath, accountEntries]) => {
		const isArray = _.isArray(accountEntries) && !_.isEmpty(accountEntries);
		const isObject = _.isPlainObject(accountEntries);
		const isNumberOrString = _.isNumber(accountEntries) || _.isString(accountEntries);
		// console.log({accountName, accountEntries})
		const l
			= (isArray) ? accountEntries
			: (isObject) ? [accountEntries]
			: (isNumberOrString) ? [{amount: Amount.simplify(Amount.normalize(accountEntries))}]
			: [{}];
		l.forEach((accountEntry, i) => {
			// If an entry is missing an amount, fill it in last.
			if (!accountEntry.amount) {
				last = accountPath.concat([i]);
			}
			else {
				lastAmount = Amount.subtract(lastAmount, accountEntry.amount);
			}
		});
		_.set(accounts, accountPath, l);
	});

	if (last) {
		_.set(accounts, last.concat(["amount"]), lastAmount);
	}
}

function iterateAccounts(accounts, fn) {
	const l = PlaceholderMap.toPairs(accounts);
	// console.log({accounts})
	l.forEach(([accountName, accountEntries]) => {
		// console.log({accountName, accountEntries})
		const l = (_.isArray(accountEntries)) ? accountEntries : [accountEntries];
		l.forEach(accountEntry => {
			// console.log({accountEntry})
			fn(accountName, accountEntry);
		});
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
				.updateIn(["revenues", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["revenues", "total"], 0, n => subtractAmountsIM(n, amount));
		}
		else if (_.isEqual(["expenses", "primary"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["costOfRevenues", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["costOfRevenues", "total"], 0, n => subtractAmountsIM(n, amount));
		}
		else if (_.isEqual(["expenses", "period"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["periodExpenses", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["periodExpenses", "total"], 0, n => subtractAmountsIM(n, amount));
		}
		else if (_.isEqual(["revenues", "secondary"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["secondaryGains", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["secondaryGains", "total"], 0, n => subtractAmountsIM(n, amount));
		}
		else if (_.isEqual(["expenses", "secondary"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["secondaryLosses", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["secondaryLosses", "total"], 0, n => subtractAmountsIM(n, amount));
		}
		else if (_.isEqual(["expenses", "income tax"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["incomeTax", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["incomeTax", "total"], 0, n => subtractAmountsIM(n, amount));
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
				.updateIn(["assetsCurrent", "accounts", accountName2], 0, n => addAmountsIM(n, amount))
				.updateIn(["assetsCurrent", "total"], 0, n => addAmountsIM(n, amount))
				.updateIn(["debitsTotal", "total"], 0, n => addAmountsIM(n, amount));
		}
		else if (_.isEqual(["assets", "long-term"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["assetsLongterm", "accounts", accountName2], 0, n => addAmountsIM(n, amount))
				.updateIn(["assetsLongterm", "total"], 0, n => addAmountsIM(n, amount))
				.updateIn(["debitsTotal", "total"], 0, n => addAmountsIM(n, amount));
		}
		else if (_.isEqual(["assets", "intangible"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["assetsIntangible", "accounts", accountName2], 0, n => addAmountsIM(n, amount))
				.updateIn(["assetsIntangible", "total"], 0, n => addAmountsIM(n, amount))
				.updateIn(["debitsTotal", "total"], 0, n => addAmountsIM(n, amount));
		}

		// Liabilities
		else if (_.isEqual(["liabilities", "current"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["liabilitiesCurrent", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["liabilitiesCurrent", "total"], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["liabilitiesTotal", "total"], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => subtractAmountsIM(n, amount));
		}
		else if (_.isEqual(["liabilities", "long-term"], _.take(accountPath, 2))) {
			const accountName2 = _.drop(accountPath, 2).join(":") || "general";
			report = report
				.updateIn(["liabilitiesLongterm", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["liabilitiesLongterm", "total"], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["liabilitiesTotal", "total"], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => subtractAmountsIM(n, amount));
		}

		// Liabilities
		else if (_.isEqual(["equity"], _.take(accountPath, 1))) {
			const accountName2 = _.drop(accountPath, 1).join(":") || "general";
			report = report
				.updateIn(["equity", "accounts", accountName2], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["equity", "total"], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => subtractAmountsIM(n, amount));
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
			c1 = c1.updateIn(["accounts", accountName], 0, amount0 => subtractAmountsIM(amount0, amount));
			c1 = c1.updateIn(["accounts", "equity:retained earnings"], 0, amount0 => addAmountsIM(amount0, amount));
			// console.log("C1: "+c1)
			state = state.setIn(pathC1, c1);
		}

		// Generate closing transaction C2, which closes out all expenses to Retained Earnings
		else if (isExpense) {
			// console.log({accountName, accountEntry, amount})
			const accountName2 = _.drop(accountPath, 1).join(":") || "general";
			const pathC1 = ["transactions", "AUTOMATIC", "C2_"+period];
			let c1 = state.getIn(pathC1, Map({
				transactionType: "closing",
				description: "Expenses to Retained Earnings",
				date: dateClosing,
				accounts: Map()
			}));
			c1 = c1.updateIn(["accounts", accountName], 0, amount0 => subtractAmountsIM(amount0, amount));
			// c1 = c1.updateIn(["accounts", "equity:retained earnings"], 0, amount0 => fromJS(Amount.add(amount0, amount)));
			c1 = c1.updateIn(["accounts", "equity:retained earnings"], 0, amount0 => {
				console.log({accountName, accountEntry, amount, amount0, sum: addAmountsIM(amount0, amount)});
				return addAmountsIM(amount0, amount);
			});
			// console.log("C2: "+c1)
			state = state.setIn(pathC1, c1);
		}

		// Update equity balance
		if (isRevenue || isExpense) {
			report = report
				.updateIn(["equity", "accounts", "retained earnings"], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["equity", "total"], 0, n => subtractAmountsIM(n, amount))
				.updateIn(["creditsTotal", "total"], 0, n => subtractAmountsIM(n, amount));
				state = state.setIn(["reports", "balance", period], report);
		}
	});

	return state;
}
