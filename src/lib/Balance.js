import _ from 'lodash';
//import fs from 'fs';
//import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
//import Mustache from 'mustache';
import naturalSort from 'javascript-natural-sort';
//import program from 'commander';
//import path from 'path';
//import {sortedJsonPropertiesDeep} from './utils.js';

class Balance {
	constructor(balanceTree, cumulativeBalanceTree, cumulativeBalanceMap) {
		this.balanceTree = balanceTree;
		this.cumulativeBalanceTree = cumulativeBalanceTree;
		this.cumulativeBalanceMap = cumulativeBalanceMap;
	}

	toString() {
		const rows = [];
		function fillLines(x, path) {
			const indent = path.length - 1;
			const propertyCount = _.size(x);
			if (path.length > 0) {
				const balance = _.get(x, ":balance:", 0);
				rows.push({indent, account: _.last(path), balance: balance.toFixed(2)});
			}
			if (propertyCount > 1) {
				_.forEach(x, (value, key) => {
					if (key !== ":balance:") {
						fillLines(value, path.concat([key]));
					}
				});
			}
		}
		fillLines(this.cumulativeBalanceTree, []);
		//console.log("rows:\n"+JSON.stringify(rows, null, '\t'))

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

function calcBalanceData(data, accountFilters = []) {
	// Take the `data.balances: Map[FullyQualifiedAccountName, Balance]` and create a
	// hierarchical map from account name to sub-account maps and a ":balance:"
	// property with the balance assigned specifically to this
	// FullyQualifiedAccountName.
	const accountFilterRxs = _.map(accountFilters, s => new RegExp(`\\b${s}\\b`));
	let balanceTree = Map();
	data.get("balances").forEach((balance, accountName) => {
		//const accountPath = accountName.split(":");
		/*if (accountFilterRxs.length > 0) {
			_.forEach(accountFilterRxs, rx => {
				console.log({rx, accountName, test: rx.test(accountName)})
			});
		}*/
		if (accountFilterRxs.length == 0 || _.some(accountFilterRxs, rx => rx.test(accountName))) {
			balanceTree = balanceTree.setIn(accountName.split(":").concat(":balance:"), balance);
		}
	});
	balanceTree = balanceTree.toJS();
	//console.log(JSON.stringify(balanceTree, null, "\t"));

	function cumulate(x, path) {
		//const pathBalance = path.join(":").concat(":balance:");
		let acc = _.get(x, ":balance:", 0);
		_.forEach(x, (value, key) => {
			if (key !== ":balance:") {
				acc += cumulate(value, path.concat([key]));
			}
		});
		_.set(x, ":balance:", acc);
		//console.log({path, acc, x})
		//console.log({cumulativeBalanceTree})
		return acc;
	}
	const cumulativeBalanceTree = _.cloneDeep(balanceTree);
	cumulate(cumulativeBalanceTree, []);
	//console.log("cumulativeBalanceTree:"+JSON.stringify(cumulativeBalanceTree, null, '\t'));

	const cumulativeBalanceMap = calcCumulativeBalanceMap(cumulativeBalanceTree);

	const x = new Balance(balanceTree, cumulativeBalanceTree, cumulativeBalanceMap);
	//console.log(x.toString());

	return x;
}

function calcCumulativeBalanceMap(cumulativeBalanceTree) {
	const cumulativeBalanceMap = {};
	function makeMap(x, path) {
		//const pathBalance = path.join(":").concat(":balance:");
		const balance = _.get(x, ":balance:", 0);
		if (path.length > 0) {
			cumulativeBalanceMap[path.join(":")] = balance;
		}
		_.forEach(x, (value, key) => {
			if (key !== ":balance:") {
				makeMap(value, path.concat([key]));
			}
		});
	}
	makeMap(cumulativeBalanceTree, []);
	//console.log({cumulativeBalanceMap})
	return cumulativeBalanceMap;
}

module.exports = {
	Balance,
	calcBalanceData
};
