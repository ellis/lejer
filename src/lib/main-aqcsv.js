import _ from 'lodash';
import program from 'commander';
import CSV from 'csv';
import fs from 'fs';
import path from 'path';
import {sortedJsonPropertiesDeep} from './utils.js';

program
	.version('0.0.1')
	.usage("[options] <file ...>")
	.option('-O --outdir [path]', "Directory for output, if not the same as the input file")
	.option('--print', "Print output rather than write file")
	/*.option('-p, --peppers', 'Add peppers')
	.option('-P, --pineapple', 'Add pineapple')
	.option('-b, --bbq-sauce', 'Add bbq sauce')
	.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')*/
	.parse(process.argv);

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
			const id = (i+1).toString();
			const x2 = _.merge({id},
				_.pick(x, 'transactionId', 'localBankCode', 'localAccountNumber', 'remoteBankCode', 'remoteAccountNumber', 'date', 'valutadate', 'value_value', 'value_currency', 'localName'),
				{
					date: moment(x.date, "YYYY/MM/DD").format("YYYY-MM-DD"),
					valutadate: moment(x.valutadate, "YYYY/MM/DD").format("YYYY-MM-DD"),
					remoteName: aggregate(x, 'remoteName'),
					purpose: aggregate(x, 'purpose'),
					category: aggregate(x, 'category')
				}
			);
			data1[id] = x2;
		});
		const basename = path.basename(filename, ".csv");
		const data2 = {};
		data2[basename] = sortedJsonPropertiesDeep(data1);
		if (program.print) {
			console.log(JSON.stringify(data2, null, '\t'));
		}
		else {
			const outdir = program.outdir || path.dirname(filename);
			const outfile = path.join(outdir, basename+".orig");
			fs.writeFileSync(outfile, JSON.stringify(data2, null, '\t'), "utf8", err => {});
		}
		//console.log(JSON.stringify(data2, null, '\t'));
		//console.log(JSON.stringify(_.take(output, 2), null, '\t'));
	});
}

_.forEach(program.args, filename => {
	loadAqbankingCsv(filename);
});
