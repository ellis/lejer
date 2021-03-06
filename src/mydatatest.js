import _ from 'lodash';
import fs from 'fs';
import jiff from 'jiff';
import jsonfile from 'jsonfile';
import LineByLineReader from 'n-readlines';
import path from 'path';
import YAML from 'yamljs';

import * as core from './lib/core.js';

const dir = "/Volumes/Private Repo/finances/2015/Data/tmp";
const files = fs.readdirSync(dir);
// console.log(files.filter(file => path.extname(file) === ".orig"), files.filter(file => path.extname(file) === ".auto"));
const files2 = files.filter(file => path.extname(file) === ".orig" || path.extname(file) === ".auto");
// console.log(files2)
const filesDiffs = files.filter(file => path.extname(file) === ".user");
const filesYaml = files.filter(file => path.extname(file) === ".yaml");

const data = {};
files2.forEach(file => {
	// console.log({file})
	// console.log({name: path.join(dir, file)})
	const content = jsonfile.readFileSync(path.join(dir, file));
	_.merge(data, content);
});

filesYaml.forEach(file => {
	const doc = YAML.load(path.join(dir, file));
	console.log({doc})
	const basename = path.basename(file, path.extname(file));
	_.forEach(doc, (value, id) => {
		if (id === "_DEFAULTS") {
			// Do something
		}
		else {
			const t = _.merge({id}, value);
			_.merge(data, {
				[basename]: {
					[id]: t
				}
			});
		}
	});
});

console.log(JSON.stringify(data, null, '\t'))

filesDiffs.forEach(file => {
	const lr = new LineByLineReader(path.join(dir, file));

	let line;
	while (line = lr.next()) {
		const s = line.toString('utf8');
		const patch = JSON.parse(s);
		jiff.patchInPlace(patch, data);
	}
});

// console.log(JSON.stringify(data, null, '\t'))

let state = core.INITIAL_STATE;

_.forEach(data, (transactions, basename) => {
	// console.log({basename})
	_.forEach(transactions, (t, id) => {
		state = core.mergeTransaction(state, basename, id, t);
	});
});

console.log(JSON.stringify(state.toJS(), null, '\t'))
