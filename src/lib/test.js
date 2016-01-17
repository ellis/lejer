import _ from 'lodash';
import CSV from 'csv';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
//import process from 'process';

function aggregate(x, name) {
	let s = _.trim(x[name]);
	let n = 1;
	while (x.hasOwnProperty(name+n) && !_.isEmpty(x[name+n])) {
		s = s + ' ' + _.trim(x[name+n]);
		n++;
	}
	return s;
}

function loadAqbankingCsv(filename, cb) {
	const buffer = fs.readFileSync(filename);
	//console.log(input2.toString("utf8"))
	const input = buffer.toString("utf8");

	CSV.parse(input, {comment: '#', delimiter: ';', columns: true}, function(err, output) {
		if (err) {
			console.log({err})
		}
		const data1 = {};
		output.forEach((x, i) => {
			const x2 = _.pick(x, 'transactionId', 'localBankCode', 'localAccountNumber', 'remoteBankCode', 'remoteAccountNumber', 'date', 'valutadate', 'value_value', 'value_currency', 'localName');
			_.merge(x2, {
				remoteName: aggregate(x, 'remoteName'),
				purpose: aggregate(x, 'purpose'),
				category: aggregate(x, 'category')
			});
			data1[i] = x2;
		});
		const basename = path.basename(filename, ".csv");
		const data2 = {};
		data2[basename] = data1;
		if (!cb) {
			console.log(JSON.stringify(data2, null, '\t'));
			//console.log(JSON.stringify(_.take(output, 2), null, '\t'));
		}
		else {
			cb(data2);
		}
	});
}

function makeAuto(data, matcherSets) {
	_.forEach(data, (filedata, basename) => {
		_.forEach(filedata, (entry, lineNoText) => {
			const entry2 = _.cloneDeep(entry);
			entry2.getNegValueText = function() { return (entry.value_value.charAt(0) === '-') ? entry.value_value.substr(1) : "-"+entry.value_value; };
			for (let matchers of matcherSets) {
				const match = _.find(matchers, match => _.every(match.match, (value, key) => entry[key] === value));
				//console.log({basename, lineNoText, match: match.match, isMatch})
				if (match) {
					const result = _.cloneDeepWith(match.merge, x => {
						if (_.isString(x)) {
							return Mustache.render(x, entry2);
						}
					})
					_.merge(entry, result);
				}
			}
		});
	});
	console.log(JSON.stringify(data, null, '\t'));
}


const matchersFilename = process.argv[process.argv.length - 2];
const csvFilename = _.last(process.argv);
const matchers = require(matchersFilename);
loadAqbankingCsv(csvFilename, data => makeAuto(data, matchers));
