import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import * as core from 'lib/core.js';

const state = INITIAL_STATE;

const files = fs.readdirSync("/Volumes/Private Repo/finances/2015/Data");
const files2 = _.concat(
	files.filter(files => path.extname(file) === ".orig"),
	files.filter(files => path.extname(file) === ".auto"),
	files.filter(files => path.extname(file) === ".user")
];
for (const file in files2) {

}
