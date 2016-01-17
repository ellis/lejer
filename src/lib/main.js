import opts from 'commander';

opts
	.version('0.0.1')
	.command('aqcsv [name]', 'install one or more packages')
	/*.option('-p, --peppers', 'Add peppers')
	.option('-P, --pineapple', 'Add pineapple')
	.option('-b, --bbq-sauce', 'Add bbq sauce')
	.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')*/
	.parse(process.argv);
