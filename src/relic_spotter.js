/**
 * See https://www.coursera.org/learn/wharton-accounting/lecture/3MXca/3-1-2-relic-spotter-case-part-5
 */
import _ from 'lodash';
import {getTableString} from './lib/consoleTable.js';

const transactions = {
	"1": {
		description: "Sell shares",
		accounts: {
			"assets:cash": [{amount: 250000, bucket: "financing"}],
			"equity:common stock": [{amount: -25000}],
			"equity:additional paid-in capital": [{amount: -225000}],
		}
	},
	"3": {
		description: "Legal fees",
		accounts: {
			"assets:cash": [{amount: -3900, bucket: "operating"}],
			"expenses:legal fees": [{amount: 3900}]
		}
	},
	"4": {
		description: "Buy building and land",
		accounts: {
			"assets:cash": [{amount: 124000, bucket: "financing"}, {amount: -155000, bucket: "investing"}],
			"liabilities:mortgage payable": [{amount: -124000}],
			"assets:building": [{amount: 52000}],
			"assets:land": [{amount: 103000}]
		}
	},
	"5": {
		description: "Building renovation",
		comment: "intended to increase building value",
		accounts: {
			"assets:cash": [{amount: -33000, bucket: "investing"}],
			"assets:building": [{amount: 33000}],
		}
	},
	"6": {
		date: "2012-06-02",
		description: "Buy metal detectors",
		comment: "expected life of 2 years",
		accounts: {
			"assets:cash": [{amount: -120000, bucket: "investing"}],
			"assets:metal detectors": [{amount: 120000}],
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
		description: "Pay supplier",
		comment: "Pay for inventory bought in transaction 7",
		accounts: {
			"assets:cash": [{amount: -2000, bucket: "operating"}],
			"liabilities:accounts payable": [{amount: 2000}],
		}
	},
	"14": {
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
};

function calcTAccounts() {
	const taccounts = {};

	_.forEach(transactions, (t, id) => {
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

	console.log(JSON.stringify(taccounts, null, '\t'));
	return taccounts;
}

// Report from Lecture 2.2
function report220() {
	console.log("Unadjusted Trial Balance");

	const taccounts = calcTAccounts();
	const groups = { assets: {}, liabilities: {}, equity: {}, revenues: {}, expenses: {} };
	_.forEach(taccounts, (x, accountName) => {
		const accountPath = accountName.split(":");
		const accountName0 = accountPath[0];
		if (groups.hasOwnProperty(accountName0)) {
			_.setWith(groups, [accountName0, _.drop(accountPath, 1).join(":")], x.sum, Object);
		}
	});

	console.log(JSON.stringify(groups, null, '\t'))

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

// Report from Lecture 3.1.2
function report312() {
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

report220();

report312();
