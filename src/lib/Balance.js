import _ from 'lodash';
//import fs from 'fs';
//import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
//import Mustache from 'mustache';
import naturalSort from 'javascript-natural-sort';
//import program from 'commander';
//import path from 'path';
//import {sortedJsonPropertiesDeep} from './utils.js';

function calcBalanceData(data) {
	// Take the `data.balances: Map[FullyQualifiedAccountName, Balance]` and create a
	// hierarchical map from account name to sub-account maps and a ":balance:"
	// property with the balance assigned specifically to this
	// FullyQualifiedAccountName.
	let accountBalances = Map();
	data.get("balances").forEach((balance, accountName) => {
		accountBalances = accountBalances.setIn(accountName.split(":").concat(":balance:"), balance);
	});
	accountBalances = accountBalances.toJS();
	console.log(JSON.stringify(accountBalances, null, "\t"));

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
		//console.log({accountBalancesCumulative})
		return acc;
	}
	const accountBalancesCumulative = _.cloneDeep(accountBalances);
	cumulate(accountBalancesCumulative, []);
	console.log("accountBalancesCumulative:"+JSON.stringify(accountBalancesCumulative, null, '\t'));

	// CONTINUE

	const lines = [];
	function fillLines(x, path, displayPath = []) {
		const isRoot = _.isEmpty(path);
		const isNode = _.isPlainObject(x);
		const isSingularNode = isNode && _.size(x) === 1;

		if (!isRoot && !isSingularNode) {
			const indent = _.repeat("  ", path.length - displayPath.length);
			const text = indent + displayPath.join(":");
			const sum = accountBalancesCumulative[path.join(":")] || 0;
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

module.exports = {
	calcBalanceData
};
