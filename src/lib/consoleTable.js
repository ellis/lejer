import _ from 'lodash';

export function getTableString(rows, columnNames) {
	const widthCols = {};
	// Widths of column names
	_.forEach(columnNames, (s, i) => {
		widthCols[i] = Math.max(_.get(widthCols, i, 0), s.toString().length);
	});
	// Widths of columns in rows
	function updateWidths(rows) {
		_.forEach(rows, row => {
			_.forEach(row, (s, i) => {
				if (!_.isUndefined(s)) {
					widthCols[i] = Math.max(_.get(widthCols, i, 0), s.toString().length);
				}
			});
		});
	}
	updateWidths([columnNames]);
	updateWidths(rows);
	console.log({widthCols});

	const lines = [];
	function addLines(rows) {
		_.forEach(rows, row => {
			const line = _.map(row, (s, i) => (
				_.padEnd(s, widthCols[i])
			)).join("  ");
			lines.push(line);
			//console.log(_.padEnd(indentText+account, widthCol1) + "    " + balance);
		});
	}
	if (!_.isEmpty(columnNames)) {
		// Column names
		addLines([columnNames]);
		// Separator
		lines.push(_.map(widthCols, n => _.repeat("=", n)).join("  "));
	}
	// Row values
	addLines(rows);

	return lines.join("\n");
}
