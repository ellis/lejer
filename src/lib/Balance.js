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

	calcBalanceDisplayArray() {
		const lines = [];
		function fillLines(x, path, indent = -1) {
			//const pathBalance = path.join(":").concat(":balance:");
			const propertyCount = _.size(x);
			if (path.length > 0 && (propertyCount == 1 || propertyCount > 2)) {
				const balance = _.get(x, ":balance:", 0);
				lines.push({indent, account: path.join(":"), balance});
			}
			if (propertyCount > 1) {
				const indent2 = (_.size(x) > 2) ? indent + 1 : indent;
				_.forEach(x, (value, key) => {
					if (key !== ":balance:") {
						fillLines(value, path.concat([key]), indent2);
					}
				});
			}
		}
		fillLines(this.cumulativeBalanceTree, []);
		console.log("lines:\n"+JSON.stringify(lines, null, '\t'))
		this.toStringBalanceDisplayArray(lines)
		return lines;
	}

	toStringBalanceDisplayArray2(rows) {
		if (_.isUndefined(rows)) {
			rows = calcBalanceDisplayArray();
		}
		const widthCol1 = _.max(_.map(rows, ({indent, account}) => account.length+indent*2));
		_.forEach(rows, ({indent, account, balance}) => {
			const indentText = _.repeat("  ", indent);
			console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
		console.log();
		_.forEach(rows, ({indent, account, balance}) => {
			const indentText = _.repeat("  ", indent);
			console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
		CONTINUE
	}

	toStringBalanceDisplayArray2(rows) {
		if (_.isUndefined(rows)) {
			rows = calcBalanceDisplayArray();
		}
		const widthCol1 = _.max(_.map(rows, ({indent, account}) => account.length+indent*2));
		_.forEach(rows, ({indent, account, balance}) => {
			const indentText = _.repeat("  ", indent);
			console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
		console.log();
		_.forEach(rows, ({indent, account, balance}) => {
			const indentText = _.repeat("  ", indent);
			console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
		CONTINUE
	}
}

function calcBalanceData(data) {
	// Take the `data.balances: Map[FullyQualifiedAccountName, Balance]` and create a
	// hierarchical map from account name to sub-account maps and a ":balance:"
	// property with the balance assigned specifically to this
	// FullyQualifiedAccountName.
	let balanceTree = Map();
	data.get("balances").forEach((balance, accountName) => {
		balanceTree = balanceTree.setIn(accountName.split(":").concat(":balance:"), balance);
	});
	balanceTree = balanceTree.toJS();
	console.log(JSON.stringify(balanceTree, null, "\t"));

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
	console.log("cumulativeBalanceTree:"+JSON.stringify(cumulativeBalanceTree, null, '\t'));

	const cumulativeBalanceMap = calcCumulativeBalanceMap(cumulativeBalanceTree);

	const x = new Balance(balanceTree, cumulativeBalanceTree, cumulativeBalanceMap);
	x.calcBalanceDisplayArray();

	return x;
}

function x() {
	// CONTINUE

	const lines = [];
	function fillLines(x, path, displayPath = []) {
		const isRoot = _.isEmpty(path);
		const isNode = _.isPlainObject(x);
		const isSingularNode = isNode && _.size(x) === 1;

		if (!isRoot && !isSingularNode) {
			const indent = _.repeat("  ", path.length - displayPath.length);
			const text = indent + displayPath.join(":");
			const sum = cumulativeBalanceTree[path.join(":")] || 0;
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
	fillLines(balanceTree, []);

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

	console.log(JSON.stringify(balanceTree, null, "\t"));
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
	console.log({cumulativeBalanceMap})
	return cumulativeBalanceMap;
}

module.exports = {
	Balance,
	calcBalanceData
};
