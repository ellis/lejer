import _ from 'lodash';
import CSV from 'csv';
import fs from 'fs';
import path from 'path';

function aggregate(x, name) {
	let s = _.trim(x[name]);
	let n = 1;
	while (x.hasOwnProperty(name+n) && !_.isEmpty(x[name+n])) {
		s = s + ' ' + _.trim(x[name+n]);
		n++;
	}
	return s;
}

function loadAqbankingCsv(filename) {
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
		const outfile = path.join(path.dirname(filename), basename+".orig");
		fs.writeFileSync(outfile, JSON.stringify(data2, null, '\t'), "utf8", err => {});
		//console.log(JSON.stringify(data2, null, '\t'));
		//console.log(JSON.stringify(_.take(output, 2), null, '\t'));
	});
}

const csvFilename = _.last(process.argv);
loadAqbankingCsv(csvFilename);
