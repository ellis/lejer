import opts from 'commander';

opts
	.version('0.0.1')
	.command('aqcsv [filename]', 'convert an aqbanking CSV file to .orig')
	.command('auto [filename]', 'generate .auto file from an .orig file')
	/*.option('-p, --peppers', 'Add peppers')
	.option('-P, --pineapple', 'Add pineapple')
	.option('-b, --bbq-sauce', 'Add bbq sauce')
	.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')*/
	.parse(process.argv);
