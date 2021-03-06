import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {fromJS, Map} from 'immutable';
import Mustache from 'mustache';
import program from 'commander';
import path from 'path';
import {sortedJsonPropertiesDeep} from './utils.js';

program
	.version('0.0.1')
	.option('-m, --matcher [filename]', 'Set the matcher JSON file that will be used to autogenerate fields')
	.option('--print', "Print output rather than write file")
	.parse(process.argv);

function makeAuto(filename, matcherSets) {
	const data0 = fromJS(jsonfile.readFileSync(filename));
	let data = data0;
	const dataNew = {};
	data.forEach((filedata, basename) => {
		dataNew[basename] = {};
		filedata.forEach((entry, lineNoText) => {
			let entry2;
			for (let matchers of matcherSets) {
				const match = _.find(matchers, match => _.every(match.match, (value, key) => entry.get(key) === value));
				//console.log({basename, lineNoText, match: match.match, isMatch})
				if (match) {
					const result = _.cloneDeepWith(match.merge, x => {
						if (_.isString(x)) {
							if (!entry2) {
								entry2 = _.cloneDeep(entry.toJS());
								entry2.getNegValueText = function() { return (entry.value_value.charAt(0) === '-') ? entry.value_value.substr(1) : "-"+entry.value_value; };
							}
							return Mustache.render(x, entry2);
						}
					});
					//console.log(result);
					//console.log(fromJS(result));
					data = data.mergeDeepIn([basename, lineNoText], fromJS(result));
					if (!dataNew[basename].hasOwnProperty(lineNoText))
						dataNew[basename][lineNoText] = {};
					_.merge(dataNew[basename][lineNoText], result);
					//_.merge(entry, result);
					//_.set(dataNew, basename, _.get(dataNew, basename, {}));
					//_.merge(_.get(dataNew, [basename, lineNoText]), [basename, lineNoText], result);
				}
			}
		});
		if (_.isEmpty(dataNew[basename]))
			delete dataNew[basename];
	});

	const data2 = sortedJsonPropertiesDeep(dataNew);
	const output = JSON.stringify(data2, null, '\t');
	if (program.print) {
		/*console.log("diff:")
		const diff1 = diff(data0, data);
		diff1.forEach(patch => console.log(JSON.stringify(patch.toJS())));
		console.log();
		console.log(JSON.stringify(patch(Map(), diff1).toJS(), null, '\t'))
		const data2 = sortedJsonPropertiesDeep(data.toJS());*/
		console.log(output);
	}
	else {
		const outdir = program.outdir || path.dirname(filename);
		const basename = path.basename(filename, ".orig");
		const outfile = path.join(outdir, basename+".auto");
		fs.writeFileSync(outfile, output, "utf8", err => {});
	}
}

_.forEach(program.args, filename => {
	const matcherSets = jsonfile.readFileSync(program.matcher);
	makeAuto(filename, matcherSets);
});
