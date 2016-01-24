import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
import Mustache from 'mustache';
import naturalSort from 'javascript-natural-sort';
import program from 'commander';
import path from 'path';
import {sortedJsonPropertiesDeep} from './utils.js';

program
	.version('0.0.1')
	.usage("[options] <dir ...>")
	.parse(process.argv);

function loadDirs(dirs) {
	const data = {};
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
				// FIXME: use a currency object to track all of the currencies used, rather than hardcode EUR
				const accountEntry = accountEntry0.set("amount", sumText+" EUR");
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

const data1 = checkEntries(data0);
//data1.forEach((x, basename) => console.log(`${basename}: ${x.size}`))

function do_balance(data) {
	let accountBalances = Map();
	data.get("balances").forEach((balance, accountName) => {
		accountBalances = accountBalances.setIn(accountName.split(":"), balance);
	});
	accountBalances = accountBalances.toJS();
	//console.log(JSON.stringify(accountBalances, null, "\t"));

	const accumulatedBalances = {};
	function sum(x, path) {
		let acc = 0;
		if (_.isPlainObject(x)) {
			_.forEach(x, (value, key) => {
				acc += sum(value, path.concat([key]));
			});
		}
		else {
			acc = x;
		}
		//console.log({path, acc})
		if (!_.isEmpty(path)) {
			accumulatedBalances[path.join(":")] = acc;
			//console.log({accumulatedBalances})
		}
		return acc;
	}
	const totalSum = sum(accountBalances, []);
	//console.log({accumulatedBalances, totalSum});

	const lines = [];
	function fillLines(x, path, displayPath = []) {
		const isRoot = _.isEmpty(path);
		const isNode = _.isPlainObject(x);
		const isSingularNode = isNode && _.size(x) === 1;

		if (!isRoot && !isSingularNode) {
			const indent = _.repeat("  ", path.length - displayPath.length);
			const text = indent + displayPath.join(":");
			const sum = accumulatedBalances[path.join(":")] || 0;
			lines.push([text, sum]);
		}

		// Recurse into children
		if (isNode) {
			const keys = _.keys(x);
			keys.sort(naturalSort);
			if (isSingularNode) {
				const key = keys[0];
				fillLines(x[key], path.concat([key]), displayPath.concat(key));
			}
			else {
				_.forEach(x, (value, key) => {
					const path2 = path.concat([key]);
					fillLines(value, path2, [key]);
				});
			}
		}
	}
	fillLines(accountBalances, []);

	const widthCol1 = _.max(_.map(lines, ([s,]) => s.length));
	_.forEach(lines, ([text, value]) => {
		console.log(_.padEnd(text, widthCol1) + "    " + value);
	});
	//
	/*function compress(x) {
		_.forEach(x, (value, key) => {
			if ()
		})
		if (x.size === 1) {
			return
		}
	}*/

	console.log(JSON.stringify(accountBalances, null, "\t"));
}

function repl() {
	const vorpal = require('vorpal')();
	vorpal
		.command("data", "print data in JSON format")
		.action((args, cb) => { console.log(JSON.stringify(data1.toJS(), null, '\t')); cb(); });
	vorpal
		.command("balance", "show account balances")
		.action((args, cb) => { do_balance(data1); cb(); });
	vorpal
		.delimiter("lejer >")
		.show();
};

repl();
