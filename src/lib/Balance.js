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
	let accountBalances = Map();
	data.get("balances").forEach((balance, accountName) => {
		accountBalances = accountBalances.setIn(accountName.split(":"), balance);
	});
	accountBalances = accountBalances.toJS();
	console.log(JSON.stringify(accountBalances, null, "\t"));

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
	console.log({accumulatedBalances, totalSum});

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

module.exports = {
	calcBalanceData
};
