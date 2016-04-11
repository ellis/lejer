import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import path from 'path';

import * as core from './lib/core.js';

const dir = "/Volumes/Private Repo/finances/2015/Data";
const files = fs.readdirSync(dir);
// console.log(files.filter(file => path.extname(file) === ".orig"), files.filter(file => path.extname(file) === ".auto"));
const files2 = _.concat(
	files.filter(file => path.extname(file) === ".orig"),
	files.filter(file => path.extname(file) === ".auto")
);
// console.log(files2)
const filesDiffs = files.filter(file => path.extname(file) === ".user");

const data = {};
files2.forEach(file => {
	// console.log({file})
	// console.log({name: path.join(dir, file)})
	const content = jsonfile.readFileSync(path.join(dir, file));
	_.merge(data, content);
});

filesDiffs.forEach(file => {
	CONTINUE
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
