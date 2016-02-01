import _ from 'lodash';
import Immutable, {List, Map, fromJS} from 'immutable';
import naturalSort from 'javascript-natural-sort';

export default class Register {
	constructor(data, accountFilters = []) {
		const accountFilterRxs = _.map(accountFilters, s => new RegExp(`\\b${s}\\b`));
		let l = [];
		data.get("entries", Map()).forEach((entries, basename) => {
			entries.forEach((entry, entryId) => {
				const isOk = true;// (accountFilterRxs.length == 0 || _.some(accountFilterRxs, rx => rx.test(accountName)));
				if (isOk) {
					const accounts = [];
					entry.get("accounts").forEach(x => {
						accounts.push(x);
					});
					const registerEntry = {
						date: entry.get("date"),
						basename,
						entryId,
						name: entry.get("remoteName"),
						accounts
					};
					l.push(registerEntry);
				}
			});
		});
		//console.log({l});
		//
		this.registerEntries = l;
	}

	toString() {
		const rows = [];
		_.forEach(this.registerEntries, entry => {
			let first = true;
			_.forEach(entry.accounts, account => {
				account.forEach((accountEntryData, accountName) => {
					console.log({accountName, accountEntryData})
					const row = (first) ? [entry.date, entry.name] : ["", ""];
					row.push(accountName);
					row.push(accountEntryData.get("amount"));
					rows.push(row);
				});
			});
		});
		console.log({rows})

		// calculate width of all columns
		const widthCols = _.range(4).map(i => _.max(_.map(rows, row => row[i].length)));
		console.log({widthCols});

		const lines = [];
		_.forEach(rows, row => {
			const line = _.padEnd(row[0], widthCols[0]) + "  " + _.padEnd(row[1], widthCols[1]) + "  " + _.padEnd(row[2], widthCols[2]) + "  " + _.padStart(row[3], widthCols[3]);
			lines.push(line);
			//console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
		//console.log();
		return lines.join("\n");
	}
}
