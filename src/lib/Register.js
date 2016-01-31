import _ from 'lodash';
import Immutable, {List, Map, fromJS} from 'immutable';
import naturalSort from 'javascript-natural-sort';

class Register {
	constructor(registerEntries) {
		this.registerEntries = registerEntries;
	}

	toString() {
		const rows = [];
		_.forEach(this.registerEntries, entry => {
			let first = true;
			_.forEach(entry.accounts, (x, accountName) => {
				const row = (first) ? [entry.date, entry.name] : ["", ""];
				row.push(accountName);
				row.push(x.amount);
				rows.push(row);
			});
		});

		CONTINUE: calculate width of all rows
		const widthCol1 = _.max(_.map(rows, ({indent, account}) => account.length+indent*2));
		const widthCol2 = _.max(_.map(rows, ({balance}) => balance.length));

		const lines = [];
		_.forEach(rows, ({indent, account, balance}) => {
			const indentText = _.repeat("  ", indent);
			const line = _.padEnd(indentText+account, widthCol1) + "    " + _.padStart(balance, widthCol2);
			lines.push(line);
			//console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
		//console.log();
		return lines.join("\n");
	}
}

function calcRegisterData(data, accountFilters = []) {
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
				];
				l.push(registerEntry);
			}
		});
	});
	return new Register(l);
}

module.exports = {
	Register,
	calcRegisterData
};
