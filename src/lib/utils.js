import _ from 'lodash';
import assert from 'assert';
import naturalSort from 'javascript-natural-sort';

export function sortedJsonPropertiesDeep(x) {
	assert(_.isPlainObject(x));
	const keys = _.keys(x);
	keys.sort(naturalSort);
	const y = _(keys).map(key => {
		const xx = x[key];
		return [key, (_.isPlainObject(xx)) ? sortedJsonPropertiesDeep(xx) : xx];
	}).fromPairs().value();
	return y;
}
