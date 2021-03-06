import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
import Mustache from 'mustache';
import naturalSort from 'javascript-natural-sort';
import program from 'commander';
import path from 'path';
import Balance from './Balance.js';
import Register from './Register.js';
import {sortedJsonPropertiesDeep} from './utils.js';

program
	.version('0.0.1')
	.usage("[options] <dir ...>")
	.parse(process.argv);

function loadDirs(dirs) {
	const data = {};
	// Load data files from all directories pass on the command line:
	_.forEach(program.args, dir => {
		if (fs.existsSync(dir)) {
			// Load all json files into a map to a list of
			const filenames = fs.readdirSync(dir);
			const filenames1 = filenames.filter(s => path.extname(s) === ".orig");
			const filenames2 = filenames.filter(s => path.extname(s) === ".auto");
			const filenames3 = filenames.filter(s => path.extname(s) === ".user");
			_.forEach([filenames1, filenames2, filenames3], filenames => {
				_.forEach(filenames, filename => {
					const content = jsonfile.readFileSync(path.join(dir, filename));
					_.merge(data, content);
				});
			});
		}
	});

	// Add path = [basename, entryId] to each entry
	_.forEach(data, (entries, basename) => {
		_.forEach(entries, (entry, entryId) => {
			data[basename][entryId].path = [basename, entryId];
		});
	});

	//console.log(JSON.stringify(data, null, '\t'))
	return fromJS(data);
}

let data0 = loadDirs(program.args);
//console.log(JSON.stringify(data0.toJS(), null, '\t'))

//data0.forEach((x, basename) => console.log(`${basename}: ${x.size}`))

function checkEntries(data0) {
	const balances = {};
	let data = data0;
	data.forEach((entries, basename) => {
		entries.forEach((entry, entryId) => {
			const accountsList = [];
			//console.log({entry})
			entry.get("accounts", Map()).forEach((accounts, accountsType) => {
				accounts.forEach((accountEntry, accountName) => {
					const accountEntries = (List.isList(accountEntry)) ? accountEntry : List([accountEntry]);
					accountEntries.forEach(accountEntry => {
						accountsList.push([accountsType, accountName, accountEntry]);
					});
				});
			});
			// Sum of values
			const sum = _.reduce(accountsList, (acc, [, , accountEntry]) => {
				//console.log({accountEntry})
				if (!accountEntry.has("amount")) {
					return acc;
				}
				else {
					return acc + Number(accountEntry.get("amount").split(" ")[0]);
				}
			}, 0);
			const sumText = sum.toFixed(2);
			// Check for accounts with missing value
			const accountsWithoutAmount = _.filter(accountsList, ([, , accountEntry]) => !accountEntry.has("amount"));
			if (accountsList.length === 0) {
				data = data.setIn([basename, entryId, "errors"], List("no accounts assigned"));
			}
			else if (accountsWithoutAmount.length === 0) {
				// Sum should be 0
				if (sumText !== "0.00") {
					data = data.setIn([basename, entryId, "errors"], List("account values do not sum to 0"));
				}
			}
			else if (accountsWithoutAmount.length === 1) {
				const [accountsType, accountName, accountEntry0] = accountsWithoutAmount[0];
				const negSumText = (_.startsWith(sumText, "-")) ? sumText.substr(1) : "-"+sumText;
				// FIXME: use a currency object to track all of the currencies used, rather than hardcode EUR
				const accountEntry = accountEntry0.set("amount", negSumText+" EUR");
				data = data.setIn([basename, entryId, "accounts", accountsType, accountName], accountEntry);
			}
			else {
				data = data.setIn([basename, entryId, "errors"], List("multiple accounts without assigned value"));
			}
			//console.log({sum, sumText, accountsList, accountsWithoutAmount})

			// Accumulate account balances
			data.getIn([basename, entryId, "accounts"]).forEach(accounts => {
				accounts.forEach((accountEntry, accountName) => {
					const accountEntries = (_.isArray(accountEntry)) ? accountEntry : [accountEntry];
					accountEntries.forEach(accountEntry => {
						const n0 = _.get(balances, accountName, 0);
						const n1 = n0 + Number(accountEntry.get("amount", "0").split(" ")[0]);
						_.set(balances, accountName, n1);
					});
				});
			});
		});
	});
	return Map({
		entries: data,
		balances: fromJS(balances)
	});
}

let data1 = checkEntries(data0);
//data1.forEach((x, basename) => console.log(`${basename}: ${x.size}`))

function do_balance(data, accountFilters = []) {
	const balanceData = Balance.calcBalanceData(data, accountFilters);
	console.log(balanceData.toString());
}

function do_register(data, accountFilters = []) {
	const registerData = new Register(data, accountFilters);
	data1 = data1.setIn(["repl", "register"], fromJS(registerData.registerEntries));
	console.log(registerData.toString());
}

function repl(args) {
	//console.log("repl: "+JSON.stringify(args))
	const vorpal = require('vorpal')();
	vorpal
		.command("dump", "print data in JSON format")
		.action((args, cb) => { console.log(JSON.stringify(data1.toJS(), null, '\t')); cb(); });
	vorpal
		.command("balance [accounts...]", "show account balances, optionally filtered to only show the given accounts")
		.action((args, cb) => { do_balance(data1, args.accounts); cb(); });
	vorpal
		.command("register [accounts...]", "show register of journal entries, optionally filtered to only show the given accounts")
		.action((args, cb) => { do_register(data1, args.accounts); cb(); });
	vorpal
		.command("test", "test")
		.action((args, cb) => { Balance.calcBalanceData(data1); cb(); });

	if (_.isEmpty(args)) {
		vorpal
			.delimiter("lejer >")
			.show();
	}
	else {
		vorpal.parse(args);
	}
};

const args = (process.argv.length > 3) ? _.concat(_.take(process.argv, 2), _.drop(process.argv, 3)) : undefined;
//console.log(JSON.stringify(process.argv))
//repl(_.take(process.argv, 2).concat(["test"]));
repl(args);
