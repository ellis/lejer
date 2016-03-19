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
	/*
	const cors = printAndSum("Cost of Revenues", ["expenses:depreciation:equipment", "expenses:software amortization", "expenses:cost of goods sold"], -1);
	rows.push(["Total cost of revenues", cors]);
	const gross = revenues + cors;
	rows.push(["Gross profit", gross]);
	rows.push([]);

	const sga = printAndSum("Period costs", ["expenses:salaries", "expenses:legal fees", "expenses:advertising", "expenses:depreciation:buildings"], -1);
	rows.push(["Total SG&A", sga]);
	const operatingIncome = gross + sga;
	rows.push(["Operating income", operatingIncome]);
	rows.push([]);

	const gains = printAndSum("Secondary gains & losses", ["revenues:interest", "expenses:interest"], -1);
	rows.push(["Total gains", gains]);
	rows.push([]);

	const ebt = operatingIncome + gains;
	rows.push(["Pre-tax income", ebt]);
	rows.push([]);

	const tax = -630;
	rows.push(["Income tax expense", tax]);
	const netIncome = ebt + tax;
	rows.push(["Net income", netIncome]);
	rows.push([]);

	console.log(getTableString(rows, ["Account", "Balance"]));
	console.log();
	*/
}
