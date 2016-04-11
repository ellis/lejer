import _ from 'lodash';
import assert from 'assert';

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
	// console.log({a1, a2})
	const customizer = (n1, n2) => (_.isNumber(n1) && _.isNumber(n2)) ? n1 - n2 : undefined;
	const result = _.mergeWith(_.clone(a1), a2, customizer);
	return simplify(result);
}
