import _ from 'lodash';
import assert from 'assert';
import math from 'mathjs';

export function normalize(x, config = {}) {
	// console.log({config})
	if (_.isPlainObject(x)) {
		return x;
	}
	else if (_.isNumber(x)) {
		// console.log({a: config.defaultCurrency, b: config.defaultCurrency || ""})
		return {[config.defaultCurrency || ""]: x};
	}
	else if (_.isString(x)) {
		const s = x.trim();
		const match1 = s.match(/[-+,.0-9]+/);
		const numberString = match1[0];
		const number = Number(numberString);
		const nonnumberString = (s.substr(0, match1.index) + s.substr(match1.index + numberString.length)).trim();
		return {[nonnumberString || config.defaultCurrency || ""]: number};
	}
}

export function simplify(x) {
	assert(_.isPlainObject(x));

	const keys1 = Object.keys(x).filter(key => x[key]);
	// If this
	if (keys1.length === 1 && keys1[0] === "")
		return x[""];

	const result2 = {};
	// console.log({x})
	for (let i = 0; i < keys1.length; i++) {
		const key = keys1[i];
		const value = x[key];
		// console.log({key, value})
		if (value) {
			result2[key] = value;
		}
	}
	// console.log({result2})
	return result2;
}

export function compareToZero(amount) {
	if (_.isUndefined(amount))
		return 0
	else if (_.isNumber(amount)) {
		return math.compare(amount, 0);
	}
	else {
		amount = normalize(amount);

		let result = 0;
		const keys = Object.keys(amount);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const value = amount[key];
			// console.log({key, value})
			if (value) {
				const result1 = math.compare(value, 0);
				if (result1 !== 0) {
					if (result === 0) {
						result = result1;
					}
					else if (result1 !== result) {
						return 0;
					}
				}
			}
		}
		// console.log({result2})
		return result;
	}
}

export function add(amounts1, amounts2, config) {
	if (_.isNumber(amounts1) && _.isNumber(amounts2)) {
		return amounts1 + amounts2;
	}

	const a1 = normalize(amounts1, config);
	const a2 = normalize(amounts2, config);
	// console.log({a1, a2})
	const customizer = (n1, n2) => (_.isNumber(n1) && _.isNumber(n2)) ? n1 + n2 : undefined;
	const result1 = _.mergeWith(_.clone(a1), a2, customizer);
	return simplify(result1);
}

export function subtract(amounts1, amounts2, config) {
	if (_.isNumber(amounts1) && _.isNumber(amounts2)) {
		return amounts1 - amounts2;
	}
	const a1 = normalize(amounts1, config);
	const a2 = normalize(amounts2, config);
	// Since we're subtracting, make sure all keys in a2 are either in a1, or set those keys in a1 to 0.
	const keys2 = Object.keys(a2);
	for (const key of keys2) {
		if (!a1.hasOwnProperty(key)) {
			a1[key] = 0;
		}
	}
	const customizer = (n1, n2) => (_.isNumber(n1) && _.isNumber(n2)) ? n1 - n2 : undefined;
	const result = _.mergeWith(_.clone(a1), a2, customizer);
	// console.log({a1, a2, result, simplified: simplify(result)})
	return simplify(result);
}
