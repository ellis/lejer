import _ from 'lodash';
import {getTableString} from './lib/consoleTable.js';

const transactions = [
	{
		id: 1,
		accounts: {
			"assets:cash": [{amount: 250000, bucket: "financing"}],
			"equity:common stock": [{amount: -25000}],
			"equity:APIC": [{amount: -225000}],
		}
	},
	{
		id: 3,
		accounts: {
			"assets:cash": [{amount: -3900, bucket: "operating"}],
			"expenses:legal fees": [{amount: 3900}]
		}
	},
	{
		id: 3,
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
		accounts: {
			"assets:cash": [{amount: 0}],
			"": [{amount: 0}],
			"": [{amount: 0}],
		}
	},
	{
		id: 3,
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
					const row = [t.id.toString(), accountName, accountEntry.amount.toString(), "", "", ""];
					row[bucketCol] = accountEntry.amount.toString();
					rows.push(row);
				}
			});
		});
	});

	console.log(getTableString(rows));
}

report1();
