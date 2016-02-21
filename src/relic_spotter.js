/**
 * See https://www.coursera.org/learn/wharton-accounting/lecture/3MXca/3-1-2-relic-spotter-case-part-5
 */
import _ from 'lodash';
import {getTableString} from './lib/consoleTable.js';

const transactions0 = {
	"1": {
		data: "2012-04-01",
		description: "Sell shares",
		accounts: {
			"assets:cash": [{amount: 250000, bucket: "financing"}],
			"equity:common stock": [{amount: -25000}],
			"equity:additional paid-in capital": [{amount: -225000}],
		}
	},
	"3": {
		data: "2012-04-02",
		description: "Legal fees",
		accounts: {
			"assets:cash": [{amount: -3900, bucket: "operating"}],
			"expenses:legal fees": [{amount: 3900}]
		}
	},
	"4": {
		data: "2012-04-07",
		description: "Buy building and land",
		accounts: {
			"assets:cash": [{amount: 124000, bucket: "financing"}, {amount: -155000, bucket: "investing"}],
			"liabilities:mortgage payable": [{amount: -124000}],
			"assets:depreciable:buildings": [{amount: 52000}],
			"assets:land": [{amount: 103000}]
		}
	},
	"5": {
		data: "2012-05-25",
		description: "Building renovation",
		comment: "intended to increase building value",
		accounts: {
			"assets:cash": [{amount: -33000, bucket: "investing"}],
			"assets:depreciable:buildings": [{amount: 33000}],
		}
	},
	"6": {
		date: "2012-06-02",
		description: "Buy metal detectors",
		comment: "expected life of 2 years",
		accounts: {
			"assets:cash": [{amount: -120000, bucket: "investing"}],
			"assets:depreciable:equipment": [{amount: 120000}],
		}
	},
	"7": {
		date: "2012-06-30",
		description: "Buy sundries",
		accounts: {
			"assets:inventory": [{amount: 2000}],
			"liabilities:accounts payable": [{amount: -2000}],
		}
	},
	"8": {
		date: "2012-06-30",
		description: "Pay for software site license",
		comment: "three year software license",
		accounts: {
			"assets:cash": [{amount: -2100, bucket: "investing"}],
			"assets:prepaid software": [{amount: 2100}],
		}
	},
	"9": {
		date: "2012-06-30",
		description: "Buy advertising",
		comment: "prepay for 1 year",
		accounts: {
			"assets:cash": [{amount: -8000, bucket: "operating"}],
			"assets:prepaid advertising": [{amount: 8000}],
		}
	},
	"10": {
		date: "2012-06-30",
		description: "Load to Park",
		comment: "She has one year to repay",
		accounts: {
			"assets:cash": [{amount: -5000, bucket: "operating"}],
			"assets:notes receivable": [{amount: 5000}]
		}
	},
	"12": {
		date: "2012-06-30",
		description: "Declare dividends",
		accounts: {
			"equity:retained earnings": [{amount: 2500}],
			"liabilities:dividends payable": [{amount: -2500}]
		}
	},
	"13": {
		date: "2012-07-31",
		description: "Pay supplier",
		comment: "Pay for inventory bought in transaction 7",
		accounts: {
			"assets:cash": [{amount: -2000, bucket: "operating"}],
			"liabilities:accounts payable": [{amount: 2000}],
		}
	},
	"14": {
		date: "2012-08-31",
		description: "Pay dividend",
		accounts: {
			"assets:cash": [{amount: -2500, bucket: "financing"}],
			"liabilities:dividends payable": [{amount: 2500}],
		}
	},
	"15": {
		date: "2012-12-01",
		description: "Sell pre-paid rentals",
		comment: "received pre-paid rentals for following year",
		accounts: {
			"assets:cash": [{amount: 1200, bucket: "operating"}],
			"liabilities:unearned rental revenue": [{amount: -1200}],
		}
	},
	"16": {
		date: "2012-12-31",
		description: "Receive rental revenue",
		accounts: {
			"assets:cash": [{amount: 120100, bucket: "operating"}],
			"assets:accounts receivable": [{amount: 4200}],
			"revenues:rental": [{amount: -124300}],
		}
	},
	"17": {
		date: "2012-12-31",
		description: "Pay for inventory",
		accounts: {
			"assets:cash": [{amount: -38000, bucket: "operating"}],
			"liabilities:accounts payable": [{amount: -2000}],
			"assets:inventory": [{amount: 40000}],
		}
	},
	"18": {
		date: "2012-12-31",
		description: "Sales of sundries",
		accounts: {
			"assets:cash": [{amount: 35000, bucket: "operating"}],
			"revenues:sales": [{amount: -35000}],
		}
	},
	"19": {
		description: "Cost of sundries sold",
		date: "2012-12-31",
		accounts: {
			"assets:inventory": [{amount: -30000}],
			"expenses:cost of goods sold": [{amount: 30000}],
		}
	},
	"20": {
		description: "Pay salaries",
		date: "2012-12-31",
		accounts: {
			"assets:cash": [{amount: -82000, bucket: "operating"}],
			"expenses:salaries": [{amount: 82000}],
		}
	},
	"21": {
		phase: "adjusting",
		description: "Accrued interest",
		date: "2012-12-31",
		accounts: {
			"liabilities:interest": [{amount: -4900}],
			"expenses:interest": [{amount: 4900}]
		}
	},
	"22": {
		phase: "adjusting",
		description: "Depreciation on building",
		date: "2012-12-31",
		accounts: {
			"assets:depreciable:accumulated depreciation": [{amount: -1500}],
			"expenses:depreciation:buildings": [{amount: 1500}]
		}
	},
	"23": {
		phase: "adjusting",
		description: "Depreciation on metal detectors",
		date: "2012-12-31",
		accounts: {
			"assets:depreciable:accumulated depreciation": [{amount: -30000}],
			"expenses:depreciation:equipment": [{amount: 30000}]
		}
	},
	"24": {
		phase: "adjusting",
		description: "Amortization on software license, see #8",
		date: "2012-12-31",
		accounts: {
			"assets:prepaid software": [{amount: -350}],
			"expenses:software amortization": [{amount: 350}]
		}
	},
	"25": {
		phase: "adjusting",
		description: "Expense prepaid advertising, see #9",
		date: "2012-12-31",
		accounts: {
			"assets:prepaid advertising": [{amount: -4000}],
			"expenses:advertising": [{amount: 4000}]
		}
	},
	"26": {
		phase: "adjusting",
		description: "Accumulated interest receivable, see #10",
		date: "2012-12-31",
		accounts: {
			"revenues:interest": [{amount: -250}],
			"assets:interest receivable": [{amount: 250}]
		}
	},
	"27": {
		phase: "adjusting",
		description: "Earning of unearned revenues, see #15",
		date: "2012-12-31",
		accounts: {
			"revenues:rental": [{amount: -100}],
			"liabilities:unearned rental revenue": [{amount: 100}]
		}
	},
	"28": {
		phase: "adjusting",
		description: "Estimated income taxes",
		date: "2012-12-31",
		accounts: {
			"liabilities:income taxes payable": [{amount: -630}],
			"expenses:income taxes": [{amount: 630}],
		}
	},
	/*"C1": {
		phase: "closing",
		description: "Revenues to Retained Earnings",
		date: "2012-12-31",
		accounts: {
			"equity:retained earnings": [{amount: -159650}],
			"revenues:sales": [{amount: 35000}],
			"revenues:rental": [{amount: 124400}],
			"revenues:interest": [{amount: 250}]
		}
	},
	"C2": {
		"phase": "closing",
		description: "Expenses to Retained Earnings",
		date: "2012-12-31",
		"accounts": {
			"equity:retained earnings": [{amount: 159650}],
			"expenses:advertising": [ { "amount": -4000 } ],
			"expenses:cost of goods sold": [ { "amount": -30000 } ],
			"expenses:depreciation:buildings": [ { "amount": -1500 } ],
			"expenses:depreciation:equipment": [ { "amount": -30000 } ],
			"expenses:income taxes": [ { "amount": -630 } ],
			"expenses:interest": [ { "amount": -4900 } ],
			"expenses:legal fees": [ { "amount": -3900 } ],
			"expenses:salaries": [ { "amount": -82000 } ],
			"expenses:software amortization": [ { "amount": -350 } ]
		}
	}*/
};

const accountingPhases = {
	adjusting: 1,
	closing: 2,
};

function addClosingTransactions(transactions) {
	const taccounts = calcTAccounts(transactions, accountingPhases.adjusting);

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

function calcTAccounts(transactions, phaseMax = 0, phaseMin = 0) {
	const taccounts = {};

	_.forEach(transactions, (t, id) => {
		// Filter the transactions by phase
		const tPhase = _.get(accountingPhases, t.phase, 0);
		//console.log({tPhase, phase})
		if (tPhase < phaseMin || tPhase > phaseMax) return;

		_.forEach(t.accounts, (accountEntries, accountName) => {
			const x = _.get(taccounts, [accountName], {items: {}, sumOut: 0, sumIn: 0, sum: 0});
			_.forEach(accountEntries, accountEntry => {
				const amount = accountEntry.amount || 0;
				if (amount < 0) {
					x.sumOut += amount;
				}
				else if (amount > 0) {
					x.sumIn += amount;
				}
				x.sum += amount;
				x.items[id] = amount;
			});
			_.set(taccounts, [accountName], x);
		});
	});

	//console.log(JSON.stringify(taccounts, null, '\t'));
	return taccounts;
}

// Report from Lecture 2.2
function reportTrialBalance(transactions, phase = 0) {
	const title
		= (phase === 0) ? "Unadjusted Trial Balance"
		: (phase === 1) ? "Adjusted Trial Balance"
		: (phase === 2) ? "Post-Closing Trial Balances"
		: "Balance";
	console.log(title);

	const taccounts = calcTAccounts(transactions, phase);
	const groups = { assets: {}, liabilities: {}, equity: {}, revenues: {}, expenses: {} };
	_.forEach(taccounts, (x, accountName) => {
		const accountPath = accountName.split(":");
		const accountName0 = accountPath[0];
		if (groups.hasOwnProperty(accountName0)) {
			_.setWith(groups, [accountName0, _.drop(accountPath, 1).join(":")], x.sum, Object);
		}
	});

	//console.log(JSON.stringify(groups, null, '\t'))

	const rows = [];
	let sumIn = 0;
	let sumOut = 0;
	_.forEach(groups, (items) => {
		const l = _(items).toPairs().sortBy(x => -Math.abs(x[1])).value();
		//console.log(l)
		_.forEach(l, ([accountName, amount]) => {
			const amountIn = Math.max(amount, 0);
			const amountOut = Math.min(amount, 0);
			sumIn += amountIn;
			sumOut += amountOut;
			rows.push([accountName, amountIn, amountOut]);
		});
		rows.push([]);
	});
	rows.push(["Total", sumIn, sumOut]);

	console.log(getTableString(rows, ["Account", "In", "Out"]));
	console.log();
}

// Report from Lecture 2.2
function reportTrialBalances(transactions) {
	console.log("Trial Balances");

	// Array of the min/max phases to consider
	// This is ultimately for producing columns for:
	// * Unadjusted Trial Balance
	// * Adjusting Transactions
	// * Adjusted Trial Balance
	// * Closing Transactions
	// * Post-Closing Trial Balance
	const phases = [
		[0, 0], // standard transactions
		[accountingPhases.adjusting, accountingPhases.adjusting], // adjusting transactions
		[0, accountingPhases.adjusting], // adjusted transactions
		[accountingPhases.closing, accountingPhases.closing], // closing transactions
		[0, accountingPhases.closing] // closed transactions
	];
	// Calculate the t-accounts for all the phases ranges in 'phases'
	const taccountsList = phases.map(([phaseMin, phaseMax]) => calcTAccounts(transactions, phaseMax, phaseMin));
	// Create a list of "groups" for each of the phase ranges, where transactions are groups by assets/liabilities/equity/revenues/expenses.
	// A 'groups' item looks something like this:
	// `{ assets: { cash: 123, equipment: 456 }, liabilities: ... }`
	const groupsList = taccountsList.map(taccounts => {
		const groups = { assets: {}, liabilities: {}, equity: {}, revenues: {}, expenses: {} };
		_.forEach(taccounts, (x, accountName) => {
			const accountPath = accountName.split(":");
			const accountName0 = accountPath[0];
			if (groups.hasOwnProperty(accountName0)) {
				_.setWith(groups, [accountName0, _.drop(accountPath, 1).join(":")], x.sum, Object);
			}
		});
		return groups;
	});

	// Transform groupsList into a single groups object, where each category has an array of balances
	const groups = { assets: {}, liabilities: {}, equity: {}, revenues: {}, expenses: {} };
	_.forEach(groupsList, (groups2, i) => {
		//console.log({i, groups2})
		_.forEach(groups2, (group, groupName) => {
			//console.log({groupName, group})
			_.forEach(group, (amount, accountName) => {
				let amounts = _.get(groups, [groupName, accountName]);
				if (_.isUndefined(amounts))
					amounts = new Array(phases.length);
				amounts[i] = amount;
				_.set(groups, [groupName, accountName], amounts);
			});
		});
	});
	//console.log(JSON.stringify(groups, null, '\t'))

	const rows = [];
	const sums = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0]
	];/*
		assets: {sumIn: 0, sumOut: 0},
		liabilities: {sumIn: 0, sumOut: 0},
		equity: {sumIn: 0, sumOut: 0},
		revenues: {sumIn: 0, sumOut: 0},
		expenses: {sumIn: 0, sumOut: 0}
	};*/
	_.forEach(groups, (group, groupName) => {
		//const l = _(group).toPairs().sortBy(x => -Math.abs(x[1])).value();
		const l = _(group).toPairs().value();
		//console.log(l)
		_.forEach(l, ([accountName, amounts]) => {
			const amountCols = _.flatMap(amounts, (amount, index) => {
				if (_.isNumber(amount)) {
					const amountIn = Math.max(amount, 0);
					const amountOut = Math.min(amount, 0);
					sums[index][0] += amountIn;
					sums[index][1] += amountOut;
					return [amountIn, amountOut];
				}
				else {
					return ["", ""];
				}
			});
			rows.push([accountName].concat(amountCols));
		});
		rows.push([]);
	});
	rows.push(["Total"].concat(_.flatten(sums)));

	console.log(getTableString(rows, ["Account", "In", "Out", "In", "Out", "In", "Out", "In", "Out", "In", "Out"]));
	console.log();
}

// Report from Lecture 2.5
// Requires the standard and adjusting transactions
function reportIncome(transactions) {
	console.log("Income Statement for 2012");

	const taccounts = calcTAccounts(transactions, accountingPhases.adjusting);
	//console.log(JSON.stringify(taccounts, null, '\t'));

	const rows = [];
	function printAndSum(title, accountNames, factor) {
		let sum = 0;
		rows.push([title]);
		_.forEach(accountNames, accountName => {
			const tsum = taccounts[accountName].sum * factor;
			rows.push(["  "+accountName, tsum]);
			sum += tsum;
		});
		return sum;
	}

	const revenues = printAndSum("Revenues", ["revenues:rental", "revenues:sales"], -1);
	rows.push(["Total revenues", revenues]);
	rows.push([]);

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
}

/*
// Report from Lecture 2.5
function reportClosing(transactions) {
	//const taccounts2 = calcTAccounts(transactions, accountingPhases.closing);
	//console.log(JSON.stringify(taccounts2, null, '\t'))

	reportTrialBalances(transactions);
}
*/

// Report from Lecture 3.1.2
// Requires the standard transactions (e.g. no adjusting or closing transactions required)
function reportCashFlows(transactions) {
	console.log("Cash flows");

	const bucketToCol = {
		operating: 3,
		investing: 4,
		financing: 5
	}
	const sums = {
		cash: 0,
		operating: 0,
		investing: 0,
		financing: 0
	};
	const rows = [];
	_.forEach(transactions, (t, id) => {
		_.forEach(t.accounts, (accountEntries, accountName) => {
			_.forEach(accountEntries, accountEntry => {
				const bucketCol = _.get(bucketToCol, accountEntry.bucket);
				if (bucketCol > 0) {
					const row = [id, t.description || accountName, accountEntry.amount.toString(), "", "", ""];
					sums.cash += accountEntry.amount;
					sums[accountEntry.bucket] += accountEntry.amount;
					row[bucketCol] = accountEntry.amount.toString();
					rows.push(row);
				}
			});
		});
	});

	rows.push(["", "", sums.cash, sums.operating, sums.investing, sums.financing]);

	console.log(getTableString(rows, ["No.", "Transaction", "Cash", "Operating", "Investing", "Financing"]));
	console.log();
}

function reportBalance(transactions) {
	console.log("Balance Sheet for 2012");

	const taccounts = calcTAccounts(transactions, accountingPhases.closing);
	console.log(JSON.stringify(taccounts, null, '\t'));

	// CONTINUE: balance sheet at 14:30

	const rows = [];
	function printAndSum(title, accountNames, factor) {
		let sum = 0;
		rows.push([title]);
		_.forEach(accountNames, accountName => {
			if (_.has(taccounts, [accountName, "sum"])) {
				const tsum = taccounts[accountName].sum * factor;
				rows.push(["  "+accountName, tsum]);
				sum += tsum;
			}
			else {
				rows.push(["  "+accountName, "???"]);
			}
		});
		return sum;
	}

	const assetsCurrent = printAndSum("Current Assets", ["assets:cash", "assets:accounts receivable", "assets:notes receivable", "assets:interest receivable", "assets:inventory", "assets:prepaid advertising"], 1);
	rows.push(["Total current assets", assetsCurrent]);
	rows.push([]);

	const assetsPPE = printAndSum("PP&E", ["assets:land", "assets:depreciable:buildings", "assets:depreciable:equipment", "assets:depreciable:accumulated depreciation"], 1);
	rows.push(["Net PP&E", assetsPPE]);
	rows.push([]);

	const assetsIntangible = printAndSum("Intangible Assets", ["assets:prepaid software"], 1);
	rows.push(["Total intagible assets", assetsIntangible]);
	rows.push([]);

	const assets = assetsCurrent + assetsPPE + assetsIntangible;
	rows.push(["Total assets", assets]);
	rows.push([]);

	const liabilitiesCurrent = printAndSum("Current Liabilities", ["liabilities:accounts payable", "liabilities:interest", "liabilities:income taxes payable", "liabilities:unearned rental revenue"], 1);
	rows.push(["Total current liabilities", liabilitiesCurrent]);
	rows.push([]);

	// CONTINUE: 15:17

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
*/
	console.log(getTableString(rows, ["Account", "Balance"]));
	console.log();
}

const transactions = addClosingTransactions(transactions0);

// Requires data from all stages (standard, adjusting, and closing transactions)
reportTrialBalances(transactions);

// Requires standard entries
reportCashFlows(transactions);

// Requires adjusting entries
reportIncome(transactions);

// Requires closing entries
reportBalance(transactions);
