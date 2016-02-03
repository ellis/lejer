import _ from 'lodash';
import Immutable, {List, Map, fromJS} from 'immutable';
import naturalSort from 'javascript-natural-sort';

export default class Register {
	constructor(data, accountFilters = []) {
		this.accountFilterRxs = _.map(accountFilters, s => new RegExp(`\\b${s}\\b`));
		let l = [];
		data.get("entries", Map()).forEach((entries, basename) => {
			entries.forEach((entry, entryId) => {
				const isOk = true;// (accountFilterRxs.length == 0 || _.some(accountFilterRxs, rx => rx.test(accountName)));
				if (isOk) {
					const accounts = [];
					entry.get("accounts").forEach(x => {
						accounts.push(x);
					});

					// Check whether entry's account pass the filter:
					_.forEach(accounts, account => {
						CONTINUE
						index++;
						account.forEach((accountEntryData, accountName) => {
							const doShow = (this.accountFilterRxs.length == 0 || _.some(this.accountFilterRxs, rx => rx.test(accountName)));
							if (doShow) {
								//console.log({accountName, accountEntryData})
								const row = (first) ? [index.toString(), entry.date, entry.name] : ["", "", ""];
								const amountText = accountEntryData.get("amount");
								const amount = _.isEmpty(amountText) ? 0 : Number(amountText.split(" ")[0]);
								sum += amount;
								row.push(accountName);
								row.push(accountEntryData.get("amount"));
								row.push(sum.toFixed(2));
								rows.push(row);
								first = false;
							}
						});
					});

					CONTINUE

					const registerEntry = {
						date: entry.get("date"),
						basename,
						entryId,
						name: entry.get("remoteName"),
						accounts
					};
					l.push([registerEntry.date, basename, parseInt(entryId), registerEntry]);
				}
			});
		});
		//console.log({l});

		// Sort
		l = _.sortBy(l, x => _.take(x, 3));
		//console.log({l});

		const rows = [];
		let sum = 0;
		let index = 0;
		_.forEach(l, ([, , , entry]) => {
			let first = true;
			_.forEach(entry.accounts, account => {
				index++;
				account.forEach((accountEntryData, accountName) => {
					const doShow = (this.accountFilterRxs.length == 0 || _.some(this.accountFilterRxs, rx => rx.test(accountName)));
					if (doShow) {
						//console.log({accountName, accountEntryData})
						const row = (first) ? [index.toString(), entry.date, entry.name] : ["", "", ""];
						const amountText = accountEntryData.get("amount");
						const amount = _.isEmpty(amountText) ? 0 : Number(amountText.split(" ")[0]);
						sum += amount;
						row.push(accountName);
						row.push(accountEntryData.get("amount"));
						row.push(sum.toFixed(2));
						rows.push(row);
						first = false;
					}
				});
			});
		});

		this.registerEntries = l;
	}

	toString() {
		const rows = [];
		let sum = 0;
		let index = 0;
		_.forEach(this.registerEntries, ([, , , entry]) => {
			let first = true;
			_.forEach(entry.accounts, account => {
				index++;
				account.forEach((accountEntryData, accountName) => {
					const doShow = (this.accountFilterRxs.length == 0 || _.some(this.accountFilterRxs, rx => rx.test(accountName)));
					if (doShow) {
						//console.log({accountName, accountEntryData})
						const row = (first) ? [index.toString(), entry.date, entry.name] : ["", "", ""];
						const amountText = accountEntryData.get("amount");
						const amount = _.isEmpty(amountText) ? 0 : Number(amountText.split(" ")[0]);
						sum += amount;
						row.push(accountName);
						row.push(accountEntryData.get("amount"));
						row.push(sum.toFixed(2));
						rows.push(row);
						first = false;
					}
				});
			});
		});
		//console.log({rows})

		// calculate width of all columns
		const widthCols = _.range(6).map(i => _.max(_.map(rows, row => row[i].length)));
		//console.log({widthCols});

		const lines = [];
		_.forEach(rows, row => {
			const line = [
				_.padStart(row[0], widthCols[0]),
				_.padEnd(row[1], widthCols[1]),
				_.padEnd(row[2], widthCols[2]),
				_.padEnd(row[3], widthCols[3]),
				_.padStart(row[4], widthCols[4]),
				_.padStart(row[5], widthCols[5])
			].join("  ");
			lines.push(line);
			//console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
		//console.log();
		return lines.join("\n");
	}
}
