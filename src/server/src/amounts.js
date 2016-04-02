function normalize(x, config) {
	if (_.isPlainObject(x)) {
		return x;
	}
	else if (_.isNumber(x)) {
		return {[config.defaultCurrency || ""]: x};
	}
	else if (_.isString(x)) {
		const s = x.trim();
		const match1 = s.match(/[-+,.0-9]+/);
		const numberString = match1[0];
		const number = Number(numberString);
		const nonnumberString = (s.substr(0, match1.index) + s.substr(match1.index + numberString.length)).trim();
		return {[nonnumberString: number]};
	}
}

export function add(amounts1, amounts2, config) {
	const a1 = normalize(amounts1, config);
	const a2 = normalize(amounts2, config);
}
