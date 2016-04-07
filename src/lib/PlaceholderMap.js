import _ from 'lodash';

/**
 * PlaceholderMap: an indirect map, whereby the first layer of keys are merely
 * placeholder keys.  Each key should have a value which is a object.
 * The "real" keys of the PlaceholderMap are then the subkeys of the placeholder
 * objects.
 */

export function toPairs(pm, placeholderPrefix = "@") {
	const pairs = [];
	const len = placeholderPrefix.length;
	for (const key in pm) {
		const value = pm[key];
		const prefix = key.substr(0, len);
		if (prefix === placeholderPrefix) {
			pairs.push.apply(pairs, _.toPairs(value));
		}
		else {
			pairs.push([key, value]);
		}
	}
	return pairs;
}

export function toObject(pm, placeholderPrefix = "@") {
	return _.fromPairs(toPairs(pm, placeholderPrefix));
}
