/**
 * See https://www.coursera.org/learn/wharton-accounting/lecture/3MXca/3-1-2-relic-spotter-case-part-5
 */
import _ from 'lodash';
import {getTableString} from './lib/consoleTable.js';

const transactions = [
	{
		id: 1,
		description: "Sell shares",
		accounts: {
			"assets:cash": [{amount: 250000, bucket: "financing"}],
			"equity:common stock": [{amount: -25000}],
			"equity:APIC": [{amount: -225000}],
		}
	},
	{
		id: 3,
		description: "Legal fees",
		accounts: {
			"assets:cash": [{amount: -3900, bucket: "operating"}],
			"expenses:legal fees": [{amount: 3900}]
		}
	},
	{
		id: 4,
		description: "Buy building and land",
		accounts: {
			"assets:cash": [{amount: 124000, bucket: "financing"}, {amount: -155000, bucket: "investing"}],
			"liabilities:mortgage payable": [{amount: -124000}],
			"assets:building": [{amount: 52000}],
			"assets:land": [{acount: 103000}]
		}
	},
	{
		id: 5,
		description: "Building renovation",
		accounts: {
			"assets:cash": [{amount: -33000, bucket: "investing"}],
			"assets:building": [{amount: 33000}],
		}
	},
	{
		id: 6,
		description: "Buy metal detectors",
		accounts: {
			"assets:cash": [{amount: -120000, bucket: "investing"}],
			"assets:metal detectors": [{amount: 120000}],
		}
	},
	{
		id: 3,
		description: "",
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		description: "",
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		description: "",
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		description: "",
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		description: "",
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		description: "",
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		description: "",
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
];

// Report from Lecture 3.1.2
function report1() {
	const bucketToCol = {
		operating: 3,
		investing: 4,
		financing: 5
	}
	const rows = [];
	_.forEach(transactions, t => {
		_.forEach(t.accounts, (accountEntries, accountName) => {
			_.forEach(accountEntries, accountEntry => {
				const bucketCol = _.get(bucketToCol, accountEntry.bucket);
				if (bucketCol > 0) {
					const row = [t.id.toString(), t.description || accountName, accountEntry.amount.toString(), "", "", ""];
					row[bucketCol] = accountEntry.amount.toString();
					rows.push(row);
				}
			});
		});
	});

	console.log(getTableString(rows, ["No.", "Transaction", "Cash", "Operating", "Investing", "Financing"]));
}

report1();
