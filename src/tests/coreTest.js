import _ from 'lodash';
import {List, Map, fromJS} from 'immutable';
import naturalSort from 'javascript-natural-sort';
import {expect} from 'chai';

import {mergeTransaction} from '../lib/core.js';

const RelicSpotter = {
	"001": {
		id: "01",
		date: "2012-04-01",
		description: "Sell shares",
		accounts: {"@user": {
			"assets:current:cash": [{amount: 250000, tags: {"reports/cash/activity": "financing"}}],
			"equity:common stock": [{amount: -25000}],
			"equity:additional paid-in capital": [{amount: -225000}],
		}}
	},
	"003": {
		id: "03",
		date: "2012-04-02",
		description: "Legal fees",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -3900, tags: {"reports/cash/activity": "operating"}}],
			"expenses:period:legal fees": [{amount: 3900}]
		}}
	},
	"004": {
		id: "04",
		date: "2012-04-07",
		description: "Buy building and land",
		accounts: {"@user": {
			"assets:current:cash": [{amount: 124000, tags: {"reports/cash/activity": "financing"}}, {amount: -155000, tags: {"reports/cash/activity": "investing"}}],
			"liabilities:long-term:mortgage payable": [{amount: -124000}],
			"assets:long-term:buildings": [{amount: 52000}],
			"assets:long-term:land": [{amount: 103000}]
		}}
	},
	"005": {
		id: "05",
		date: "2012-05-25",
		description: "Building renovation",
		comment: "intended to increase building value",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -33000, tags: {"reports/cash/activity": "investing"}}],
			"assets:long-term:buildings": [{amount: 33000}],
		}}
	},
	"006": {
		id: "06",
		date: "2012-06-02",
		description: "Buy metal detectors",
		comment: "expected life of 2 years",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -120000, tags: {"reports/cash/activity": "investing"}}],
			"assets:long-term:equipment": [{amount: 120000}],
		}}
	},
	"007": {
		id: "07",
		date: "2012-06-30",
		description: "Buy sundries",
		accounts: {"@user": {
			"assets:current:inventory": [{amount: 2000}],
			"liabilities:current:accounts payable": [{amount: -2000}],
		}}
	},
	"008": {
		id: "08",
		date: "2012-06-30",
		description: "Pay for software site license",
		comment: "three year software license",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -2100, tags: {"reports/cash/activity": "investing"}}],
			"assets:intangible:prepaid software": [{amount: 2100}],
		}}
	},
	"009": {
		id: "09",
		date: "2012-06-30",
		description: "Buy advertising",
		comment: "prepay for 1 year",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -8000, tags: {"reports/cash/activity": "operating"}}],
			"assets:current:prepaid advertising": [{amount: 8000}],
		}}
	},
	"10": {
		id: "10",
		date: "2012-06-30",
		description: "Loan to Park",
		comment: "She has one year to repay",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -5000, tags: {"reports/cash/activity": "operating"}}],
			"assets:current:notes receivable": [{amount: 5000}]
		}}
	},
	"12": {
		id: "12",
		date: "2012-06-30",
		description: "Declare dividends",
		accounts: {"@user": {
			"equity:retained earnings": [{amount: 2500}],
			"liabilities:current:dividends payable": [{amount: -2500}]
		}}
	},
	"13": {
		id: "13",
		date: "2012-07-31",
		description: "Pay supplier",
		comment: "Pay for inventory bought in transaction 7",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -2000, tags: {"reports/cash/activity": "operating"}}],
			"liabilities:current:accounts payable": [{amount: 2000}],
		}}
	},
	"14": {
		id: "14",
		date: "2012-08-31",
		description: "Pay dividend",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -2500, tags: {"reports/cash/activity": "financing"}}],
			"liabilities:current:dividends payable": [{amount: 2500}],
		}}
	},
	"15": {
		id: "15",
		date: "2012-12-01",
		description: "Sell pre-paid rentals",
		comment: "received pre-paid rentals for following year",
		accounts: {"@user": {
			"assets:current:cash": [{amount: 1200, tags: {"reports/cash/activity": "operating"}}],
			"liabilities:current:unearned rental revenue": [{amount: -1200}],
		}}
	},
	"16": {
		id: "16",
		date: "2012-12-31",
		description: "Receive rental revenue",
		accounts: {"@user": {
			"assets:current:cash": [{amount: 120100, tags: {"reports/cash/activity": "operating"}}],
			"assets:current:accounts receivable": [{amount: 4200}],
			"revenues:primary:rental": [{amount: -124300}],
		}}
	},
	"17": {
		id: "17",
		date: "2012-12-31",
		description: "Pay for inventory",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -38000, tags: {"reports/cash/activity": "operating"}}],
			"liabilities:current:accounts payable": [{amount: -2000}],
			"assets:current:inventory": [{amount: 40000}],
		}}
	},
	"18": {
		id: "18",
		date: "2012-12-31",
		description: "Sales of sundries",
		accounts: {"@user": {
			"assets:current:cash": [{amount: 35000, tags: {"reports/cash/activity": "operating"}}],
			"revenues:primary:sales": [{amount: -35000}],
		}}
	},
	"19": {
		id: "19",
		description: "Cost of sundries sold",
		date: "2012-12-31",
		accounts: {"@user": {
			"assets:current:inventory": [{amount: -30000}],
			"expenses:primary:cost of goods sold": [{amount: 30000}],
		}}
	},
	"20": {
		id: "20",
		description: "Pay salaries",
		date: "2012-12-31",
		accounts: {"@user": {
			"assets:current:cash": [{amount: -82000, tags: {"reports/cash/activity": "operating"}}],
			"expenses:period:salaries": [{amount: 82000}],
		}}
	},
	"21": {
		id: "21",
		transactionType: "adjusting",
		description: "Accrued interest",
		date: "2012-12-31",
		accounts: {"@user": {
			"liabilities:current:interest": [{amount: -4900}],
			"expenses:secondary:interest": [{amount: 4900}]
		}}
	},
	"22": {
		id: "22",
		transactionType: "adjusting",
		description: "Depreciation on building",
		date: "2012-12-31",
		accounts: {"@user": {
			"assets:long-term:accumulated depreciation": [{amount: -1500}],
			"expenses:period:depreciation": [{amount: 1500}]
		}}
	},
	"23": {
		id: "23",
		transactionType: "adjusting",
		description: "Depreciation on metal detectors",
		date: "2012-12-31",
		accounts: {"@user": {
			"assets:long-term:accumulated depreciation": [{amount: -30000}],
			"expenses:primary:depreciation": [{amount: 30000}]
		}}
	},
	"24": {
		id: "24",
		transactionType: "adjusting",
		description: "Amortization on software license, see #08",
		date: "2012-12-31",
		accounts: {"@user": {
			"assets:intangible:prepaid software": [{amount: -350}],
			"expenses:primary:software amortization": [{amount: 350}]
		}}
	},
	"25": {
		id: "25",
		transactionType: "adjusting",
		description: "Expense prepaid advertising, see #09",
		date: "2012-12-31",
		accounts: {"@user": {
			"assets:current:prepaid advertising": [{amount: -4000}],
			"expenses:period:advertising": [{amount: 4000}]
		}}
	},
	"26": {
		id: "26",
		transactionType: "adjusting",
		description: "Accumulated interest receivable, see #10",
		date: "2012-12-31",
		accounts: {"@user": {
			"revenues:secondary:interest": [{amount: -250}],
			"assets:current:interest receivable": [{amount: 250}]
		}}
	},
	"27": {
		id: "27",
		transactionType: "adjusting",
		description: "Earning of unearned revenues, see #15",
		date: "2012-12-31",
		accounts: {"@user": {
			"revenues:primary:rental": [{amount: -100}],
			"liabilities:current:unearned rental revenue": [{amount: 100}]
		}}
	},
	"28": {
		id: "28",
		transactionType: "adjusting",
		description: "Estimated income taxes",
		date: "2012-12-31",
		accounts: {"@user": {
			"liabilities:current:income taxes payable": [{amount: -630}],
			"expenses:income taxes": [{amount: 630}],
		}}
	},
};

describe('core logic', () => {

	describe('mergeTransaction', () => {

		it('merges transaction 01 into state', () => {
			const indexes = ["001"];
			const state = _.reduce(indexes, (state, indexes) => mergeTransaction(state, "RelicSpotter", indexes, RelicSpotter[indexes]), Map());
			// console.log(JSON.stringify(state, null, '\t'))
			const state2 = state.toJS();
			expect(state2.accountEntries).to.deep.equal({
				"assets:current:cash": {
					"unadjusted": { "entries": { "01": 250000 }, "sum": 250000, "sumIn": 250000 }
				},
				"equity:common stock": {
					"unadjusted": { "entries": { "01": -25000 }, "sum": -25000, "sumOut": -25000 }
				},
				"equity:additional paid-in capital": {
					"unadjusted": { "entries": { "01": -225000 }, "sum": -225000, "sumOut": -225000 }
				}
			});
			expect(state2.reports.cash).to.deep.equal({
				"2012": [
					{ "id": "01", "date": "2012-04-01", "cash": 250000, "financing": 250000 }
				]
			});
			expect(state2.reports.income).to.deep.equal({
				"2012": {}
			});
		});

		it('merges transaction 03 into state', () => {
			const indexes = ["001", "003"];
			const state = _.reduce(indexes, (state, id) => mergeTransaction(state, "RelicSpotter", id, RelicSpotter[id]), Map());
			// console.log(JSON.stringify(state, null, '\t'))
			const state2 = state.toJS();
			expect(state2.accountEntries).to.deep.equal({
				"assets:current:cash": {
					"unadjusted": { "entries": { "01": 250000, "03": -3900 }, "sum": 246100, "sumIn": 250000, "sumOut": -3900 }
				},
				"equity:common stock": {
					"unadjusted": { "entries": { "01": -25000 }, "sum": -25000, "sumOut": -25000 }
				},
				"equity:additional paid-in capital": {
					"unadjusted": { "entries": { "01": -225000 }, "sum": -225000, "sumOut": -225000 }
				},
				"expenses:period:legal fees": {
					"unadjusted": { "entries": { "03": 3900 }, "sum": 3900, "sumIn": 3900 }
				}
			});
			expect(state2.reports.cash).to.deep.equal({
				"2012": [
					{ "date": "2012-04-01", "id": "01", "cash": 250000, "financing": 250000 },
					{ "date": "2012-04-02", "id": "03", "cash": -3900, "operating": -3900 }
				]
			});
			expect(state2.reports.income).to.deep.equal({
				"2012": {
					"periodExpenses": {
						"accounts": {
							"legal fees": -3900
						},
						"total": -3900
					}
				}
			});
		});

		it('merges transaction 04 into state', () => {
			const indexes = ["001", "003", "004"];
			const state = _.reduce(indexes, (state, id) => mergeTransaction(state, "RelicSpotter", id, RelicSpotter[id]), Map());
			// console.log(JSON.stringify(state, null, '\t'))
			const state2 = state.toJS();
			expect(state2.accountEntries).to.deep.equal({
				"assets:current:cash": {
					"unadjusted": { "entries": { "01": 250000, "03": -3900, "04": -31000},
					"sum": 215100, "sumIn": 374000, "sumOut": -158900 }
				},
				"equity:common stock": {
					"unadjusted": { "entries": { "01": -25000 }, "sum": -25000, "sumOut": -25000 }
				},
				"equity:additional paid-in capital": {
					"unadjusted": { "entries": { "01": -225000 }, "sum": -225000, "sumOut": -225000 }
				},
				"expenses:period:legal fees": {
					"unadjusted": { "entries": { "03": 3900 }, "sum": 3900, "sumIn": 3900 }
				},
				"liabilities:long-term:mortgage payable": {
					"unadjusted": { "entries": { "04": -124000 }, "sum": -124000, "sumOut": -124000 }
				},
				"assets:long-term:buildings": {
					"unadjusted": { "entries": { "04": 52000 }, "sum": 52000, "sumIn": 52000 }
				},
				"assets:long-term:land": {
					"unadjusted": { "entries": { "04": 103000 }, "sum": 103000, "sumIn": 103000 }
				},
			});
			expect(state2.reports.cash).to.deep.equal({
				"2012": [
					{ "date": "2012-04-01", "id": "01", "cash": 250000, "financing": 250000 },
					{ "date": "2012-04-02", "id": "03", "cash": -3900, "operating": -3900 },
					{ "date": "2012-04-07", "id": "04", "cash": 124000, "financing": 124000 },
					{ "date": "2012-04-07", "id": "04", "cash": -155000, "investing": -155000 },
				]
			});
			expect(state2.reports.income).to.deep.equal({
				"2012": {
					"periodExpenses": {
						"accounts": {
							"legal fees": -3900
						},
						"total": -3900
					}
				}
			});
		});

		it('merges transactions thru 20 into state', () => {
			const ids = _.keys(RelicSpotter).filter(s => parseInt(s) <= 20);
			ids.sort(naturalSort);
			const state = _.reduce(ids, (state, id) => mergeTransaction(state, "RelicSpotter", id, RelicSpotter[id]), Map());
			// console.log(JSON.stringify(_.omit(state.toJS(), "transactions"), null, '\t'))
			const state2 = state.toJS();
			expect(state2.accountEntries).to.deep.equal({
				"liabilities:current:unearned rental revenue": {
					"unadjusted": { "entries": { "15": -1200 }, "sum": -1200, "sumOut": -1200 }
				},
				"expenses:period:salaries": {
					"unadjusted": { "entries": { "20": 82000 }, "sum": 82000, "sumIn": 82000 }
				},
				"assets:current:inventory": {
					"unadjusted": { "entries": { "17": 40000, "19": -30000, "07": 2000 }, "sum": 12000, "sumIn": 42000, "sumOut": -30000 }
				},
				"liabilities:long-term:mortgage payable": {
					"unadjusted": { "entries": { "04": -124000 }, "sum": -124000, "sumOut": -124000 }
				},
				"equity:additional paid-in capital": {
					"unadjusted": { "entries": { "01": -225000 }, "sum": -225000, "sumOut": -225000 }
				},
				"expenses:primary:cost of goods sold": {
					"unadjusted": { "entries": { "19": 30000 }, "sum": 30000, "sumIn": 30000 }
				},
				"assets:current:cash": {
					"unadjusted": {
						"entries": { "10": -5000, "13": -2000, "14": -2500, "15": 1200, "16": 120100, "17": -38000, "18": 35000, "20": -82000, "01": 250000, "03": -3900, "04": -31000, "05": -33000, "06": -120000, "08": -2100, "09": -8000 },
						"sum": 78800,
						"sumOut": -451500,
						"sumIn": 530300
					}
				},
				"assets:long-term:buildings": {
					"unadjusted": { "entries": { "04": 52000, "05": 33000 }, "sum": 85000, "sumIn": 85000 }
				},
				"expenses:period:legal fees": {
					"unadjusted": { "entries": { "03": 3900 }, "sum": 3900, "sumIn": 3900 }
				},
				"equity:retained earnings": {
					"unadjusted": { "entries": { "12": 2500 }, "sum": 2500, "sumIn": 2500 }
				},
				"revenues:primary:sales": {
					"unadjusted": { "entries": { "18": -35000 }, "sum": -35000, "sumOut": -35000 }
				},
				"assets:current:notes receivable": {
					"unadjusted": { "entries": { "10": 5000 }, "sum": 5000, "sumIn": 5000 }
				},
				"liabilities:current:dividends payable": {
					"unadjusted": { "entries": { "12": -2500, "14": 2500 }, "sum": 0, "sumOut": -2500, "sumIn": 2500 }
				},
				"equity:common stock": {
					"unadjusted": { "entries": { "01": -25000 }, "sum": -25000, "sumOut": -25000 }
				},
				"liabilities:current:accounts payable": {
					"unadjusted": { "entries": { "13": 2000, "17": -2000, "07": -2000 }, "sum": -2000, "sumIn": 2000, "sumOut": -4000 }
				},
				"assets:long-term:equipment": {
					"unadjusted": { "entries": { "06": 120000 }, "sum": 120000, "sumIn": 120000 }
				},
				"assets:current:prepaid advertising": {
					"unadjusted": { "entries": { "09": 8000 }, "sum": 8000, "sumIn": 8000 }
				},
				"assets:intangible:prepaid software": {
					"unadjusted": { "entries": { "08": 2100 }, "sum": 2100, "sumIn": 2100 }
				},
				"assets:current:accounts receivable": {
					"unadjusted": { "entries": { "16": 4200 }, "sum": 4200, "sumIn": 4200 }
				},
				"assets:long-term:land": {
					"unadjusted": { "entries": { "04": 103000 }, "sum": 103000, "sumIn": 103000 }
				},
				"revenues:primary:rental": {
					"unadjusted": { "entries": { "16": -124300 }, "sum": -124300, "sumOut": -124300 }
				}
			});
			expect(state2.reports.cash).to.deep.equal({
				"2012": [
					{ "date": "2012-04-01", "id": "01", "cash": 250000, "financing": 250000 },
					{ "date": "2012-04-02", "id": "03", "cash": -3900, "operating": -3900 },
					{ "date": "2012-04-07", "id": "04", "cash": 124000, "financing": 124000 },
					{ "date": "2012-04-07", "id": "04", "cash": -155000, "investing": -155000 },
					{ "date": "2012-05-25", "id": "05", "cash": -33000, "investing": -33000 },
					{ "date": "2012-06-02", "id": "06", "cash": -120000, "investing": -120000 },
					{ "date": "2012-06-30", "id": "08", "cash": -2100, "investing": -2100 },
					{ "date": "2012-06-30", "id": "09", "cash": -8000, "operating": -8000 },
					{ "date": "2012-06-30", "id": "10", "cash": -5000, "operating": -5000 },
					{ "date": "2012-07-31", "id": "13", "cash": -2000, "operating": -2000 },
					{ "date": "2012-08-31", "id": "14", "cash": -2500, "financing": -2500 },
					{ "date": "2012-12-01", "id": "15", "cash": 1200, "operating": 1200 },
					{ "date": "2012-12-31", "id": "16", "cash": 120100, "operating": 120100 },
					{ "date": "2012-12-31", "id": "17", "cash": -38000, "operating": -38000 },
					{ "date": "2012-12-31", "id": "18", "cash": 35000, "operating": 35000 },
					{ "date": "2012-12-31", "id": "20", "cash": -82000, "operating": -82000 },
				]
			});
			expect(state2.reports.income).to.deep.equal({
				"2012": {
					"revenues": {
						"accounts": {
							"rental": 124300,
							"sales": 35000
						},
						"total": 159300
					},
					"costOfRevenues": {
						"accounts": {
							"cost of goods sold": -30000
						},
						"total": -30000
					},
					"periodExpenses": {
						"accounts": {
							"salaries": -82000,
							"legal fees": -3900
						},
						"total": -85900
					}
				}
			});
		});

		it('merges transactions thru 28 into state', () => {
			const ids = _.keys(RelicSpotter).filter(s => parseInt(s) <= 28);
			ids.sort(naturalSort);
			const state = _.reduce(ids, (state, id) => mergeTransaction(state, "RelicSpotter", id, RelicSpotter[id]), Map());
			// console.log(JSON.stringify(_.omit(state.toJS(), "transactions"), null, '\t'));
			// console.log(JSON.stringify(state.toJS().transactions, null, '\t'));
			const state2 = state.toJS();
			expect(state2.accountEntries).to.deep.equal({
				"liabilities:current:unearned rental revenue": {
					"unadjusted": { "entries": { "15": -1200 }, "sum": -1200, "sumOut": -1200 },
					"adjusting": { "entries": { "27": 100 }, "sum": 100, "sumIn": 100 }
				},
				"expenses:income taxes": {
					"adjusting": { "entries": { "28": 630 }, "sum": 630, "sumIn": 630 }
				},
				"expenses:period:salaries": {
					"unadjusted": { "entries": { "20": 82000 }, "sum": 82000, "sumIn": 82000 }
				},
				"assets:current:inventory": {
					"unadjusted": { "entries": { "17": 40000, "19": -30000, "07": 2000 }, "sum": 12000, "sumIn": 42000, "sumOut": -30000 }
				},
				"expenses:primary:depreciation": {
					"adjusting": { "entries": { "23": 30000 }, "sum": 30000, "sumIn": 30000 }
				},
				"expenses:period:depreciation": {
					"adjusting": { "entries": { "22": 1500 }, "sum": 1500, "sumIn": 1500 }
				},
				"expenses:period:advertising": {
					"adjusting": { "entries": { "25": 4000 }, "sum": 4000, "sumIn": 4000 }
				},
				"liabilities:long-term:mortgage payable": {
					"unadjusted": { "entries": { "04": -124000 }, "sum": -124000, "sumOut": -124000 }
				},
				"equity:additional paid-in capital": {
					"unadjusted": { "entries": { "01": -225000 }, "sum": -225000, "sumOut": -225000 }
				},
				"expenses:primary:cost of goods sold": {
					"unadjusted": { "entries": { "19": 30000 }, "sum": 30000, "sumIn": 30000 }
				},
				"assets:current:cash": {
					"unadjusted": { "entries": { "10": -5000, "13": -2000, "14": -2500, "15": 1200, "16": 120100, "17": -38000, "18": 35000, "20": -82000, "01": 250000, "03": -3900, "04": -31000, "05": -33000, "06": -120000, "08": -2100, "09": -8000 }, "sum": 78800, "sumIn": 530300, "sumOut": -451500 }
				},
				"assets:long-term:buildings": {
					"unadjusted": { "entries": { "04": 52000, "05": 33000 }, "sum": 85000, "sumIn": 85000 }
				},
				"revenues:primary:rental": {
					"adjusting": { "entries": { "27": -100 }, "sum": -100, "sumOut": -100 }
				},
				"expenses:period:legal fees": {
					"unadjusted": { "entries": { "03": 3900 }, "sum": 3900, "sumIn": 3900 }
				},
				"expenses:secondary:interest": {
					"adjusting": { "entries": { "21": 4900 }, "sum": 4900, "sumIn": 4900 }
				},
				"equity:retained earnings": {
					"unadjusted": { "entries": { "12": 2500 }, "sum": 2500, "sumIn": 2500 }
				},
				"revenues:primary:sales": {
					"unadjusted": { "entries": { "18": -35000 }, "sum": -35000, "sumOut": -35000 }
				},
				"assets:current:notes receivable": {
					"unadjusted": { "entries": { "10": 5000 }, "sum": 5000, "sumIn": 5000 }
				},
				"revenues:secondary:interest": {
					"adjusting": { "entries": { "26": -250 }, "sum": -250, "sumOut": -250 }
				},
				"liabilities:current:income taxes payable": {
					"adjusting": { "entries": { "28": -630 }, "sum": -630, "sumOut": -630 }
				},
				"liabilities:current:dividends payable": {
					"unadjusted": { "entries": { "12": -2500, "14": 2500 }, "sum": 0, "sumOut": -2500, "sumIn": 2500 }
				},
				"equity:common stock": {
					"unadjusted": { "entries": { "01": -25000 }, "sum": -25000, "sumOut": -25000 }
				},
				"liabilities:current:accounts payable": {
					"unadjusted": { "entries": { "13": 2000, "17": -2000, "07": -2000 }, "sum": -2000, "sumOut": -4000, "sumIn": 2000 }
				},
				"assets:long-term:equipment": {
					"unadjusted": { "entries": { "06": 120000 }, "sum": 120000, "sumIn": 120000 }
				},
				"liabilities:current:interest": {
					"adjusting": { "entries": { "21": -4900 }, "sum": -4900, "sumOut": -4900 }
				},
				"assets:current:interest receivable": {
					"adjusting": { "entries": { "26": 250 }, "sum": 250, "sumIn": 250 }
				},
				"assets:current:prepaid advertising": {
					"unadjusted": { "entries": { "09": 8000 }, "sum": 8000, "sumIn": 8000 },
					"adjusting": { "entries": { "25": -4000 }, "sum": -4000, "sumOut": -4000 }
				},
				"expenses:primary:software amortization": {
					"adjusting": { "entries": { "24": 350 }, "sum": 350, "sumIn": 350 }
				},
				"assets:intangible:prepaid software": {
					"unadjusted": { "entries": { "08": 2100 }, "sum": 2100, "sumIn": 2100 },
					"adjusting": { "entries": { "24": -350 }, "sum": -350, "sumOut": -350 }
				},
				"assets:current:accounts receivable": {
					"unadjusted": { "entries": { "16": 4200 }, "sum": 4200, "sumIn": 4200 }
				},
				"assets:long-term:accumulated depreciation": {
					"adjusting": { "entries": { "22": -1500, "23": -30000 }, "sum": -31500, "sumOut": -31500 }
				},
				"assets:long-term:land": {
					"unadjusted": { "entries": { "04": 103000 }, "sum": 103000, "sumIn": 103000 }
				},
				"revenues:primary:rental": {
					"unadjusted": { "entries": { "16": -124300 }, "sum": -124300, "sumOut": -124300 },
					"adjusting": {"entries": { "27": -100 }, "sum": -100, "sumOut": -100 }
				}
			});
			expect(state2.reports.cash).to.deep.equal({
				"2012": [
					{ "date": "2012-04-01", "id": "01", "cash": 250000, "financing": 250000 },
					{ "date": "2012-04-02", "id": "03", "cash": -3900, "operating": -3900 },
					{ "date": "2012-04-07", "id": "04", "cash": 124000, "financing": 124000 },
					{ "date": "2012-04-07", "id": "04", "cash": -155000, "investing": -155000 },
					{ "date": "2012-05-25", "id": "05", "cash": -33000, "investing": -33000 },
					{ "date": "2012-06-02", "id": "06", "cash": -120000, "investing": -120000 },
					{ "date": "2012-06-30", "id": "08", "cash": -2100, "investing": -2100 },
					{ "date": "2012-06-30", "id": "09", "cash": -8000, "operating": -8000 },
					{ "date": "2012-06-30", "id": "10", "cash": -5000, "operating": -5000 },
					{ "date": "2012-07-31", "id": "13", "cash": -2000, "operating": -2000 },
					{ "date": "2012-08-31", "id": "14", "cash": -2500, "financing": -2500 },
					{ "date": "2012-12-01", "id": "15", "cash": 1200, "operating": 1200 },
					{ "date": "2012-12-31", "id": "16", "cash": 120100, "operating": 120100 },
					{ "date": "2012-12-31", "id": "17", "cash": -38000, "operating": -38000 },
					{ "date": "2012-12-31", "id": "18", "cash": 35000, "operating": 35000 },
					{ "date": "2012-12-31", "id": "20", "cash": -82000, "operating": -82000 },
				]
			});
			expect(state2.reports.income).to.deep.equal({
				"2012": {
					"revenues": {
						"accounts": {
							"rental": 124400,
							"sales": 35000
						},
						"total": 159400
					},
					"costOfRevenues": {
						"accounts": {
							"cost of goods sold": -30000,
							"software amortization": -350,
							"depreciation": -30000
						},
						"total": -60350
					},
					"periodExpenses": {
						"accounts": {
							"salaries": -82000,
							"legal fees": -3900,
							"advertising": -4000,
							"depreciation": -1500
						},
						"total": -91400
					},
					"secondaryLosses": {
						"accounts": {
							"interest": -4900
						},
						"total": -4900
					},
					"secondaryGains": {
						"accounts": {
							"interest": 250
						},
						"total": 250
					}
				}
			});
			expect(state2.reports.balance).to.deep.equal({
				"2012": {
					"assetsCurrent": {
						"accounts": {
							"cash": 78800,
							"inventory": 12000,
							"prepaid advertising": 4000,
							"notes receivable": 5000,
							"accounts receivable": 4200,
							"interest receivable": 250
						},
						"total": 104250
					},
					"assetsLongterm": {
						"accounts": {
							"buildings": 85000,
							"land": 103000,
							"equipment": 120000,
							"accumulated depreciation": -31500
						},
						"total": 276500
					},
					"assetsIntangible": {
						"accounts": {
							"prepaid software": 1750
						},
						"total": 1750
					},
					"debitsTotal": {
						"total": 382500
					},
					"liabilitiesCurrent": {
						"accounts": {
							"accounts payable": 2000,
							"dividends payable": 0,
							"unearned rental revenue": 1100,
							"interest": 4900,
							"income taxes payable": 630
						},
						"total": 8630
					},
					"liabilitiesLongterm": {
						"accounts": {
							"mortgage payable": 124000
						},
						"total": 124000
					},
					"liabilitiesTotal": {
						"total": 132630
					},
					"equity": {
						"accounts": {
							"common stock": 25000,
							"additional paid-in capital": 225000,
							"retained earnings": -130
						},
						"total": 249870
					},
					"creditsTotal": {
						"total": 382500
					},
				}
			});
			// console.log(JSON.stringify(state.toJS().reports.cashflow, null, '\t'));
			expect(state2.reports.cashflow).to.deep.equal({
				"2012": {
					"financing": {
						"transactions": [
							{
								"id": "01",
								"description": "Sell shares",
								"amount": 250000
							},
							{
								"id": "04",
								"description": "Buy building and land",
								"amount": 124000
							},
							{
								"id": "14",
								"description": "Pay dividend",
								"amount": -2500
							}
						],
						"total": 371500
					},
					"operating": {
						"transactions": [
							{
								"id": "03",
								"description": "Legal fees",
								"amount": -3900
							},
							{
								"id": "09",
								"description": "Buy advertising",
								"amount": -8000
							},
							{
								"id": "10",
								"description": "Loan to Park",
								"amount": -5000
							},
							{
								"id": "13",
								"description": "Pay supplier",
								"amount": -2000
							},
							{
								"id": "15",
								"description": "Sell pre-paid rentals",
								"amount": 1200
							},
							{
								"id": "16",
								"description": "Receive rental revenue",
								"amount": 120100
							},
							{
								"id": "17",
								"description": "Pay for inventory",
								"amount": -38000
							},
							{
								"id": "18",
								"description": "Sales of sundries",
								"amount": 35000
							},
							{
								"id": "20",
								"description": "Pay salaries",
								"amount": -82000
							}
						],
						"total": 17400
					},
					"investing": {
						"transactions": [
							{
								"id": "04",
								"description": "Buy building and land",
								"amount": -155000
							},
							{
								"id": "05",
								"description": "Building renovation",
								"amount": -33000
							},
							{
								"id": "06",
								"description": "Buy metal detectors",
								"amount": -120000
							},
							{
								"id": "08",
								"description": "Pay for software site license",
								"amount": -2100
							}
						],
						"total": -310100
					}
				}
			});
		});

		it("should accept numeric values as AmountEntries", () => {
			const t = {
				id: "001",
				accounts: {
					"@bank": { "assets:current:cash:Volksbank:Giro": 238 },
					"@user": {
						"assets:current:accounts receivable": -200,
						"revenues:pending:sales": 200,
						"revenues:primary:sales": -200,
						"liabilities:current:salestax:received": 38
					}
				}
			};
			const state = mergeTransaction(Map(), "test", "1", t);
			const state2 = state.toJS();
			// console.log(JSON.stringify(_.omit(state2, "transactions"), null, '\t'));
			// console.log(JSON.stringify(state2.transactions, null, '\t'));
			expect(state2.transactions.test["1"]).to.deep.equal({
				"id": "001",
				"accounts": {
					"@bank": {
						"assets:current:cash:Volksbank:Giro": [
							{
								"amount": 238
							}
						]
					},
					"@user": {
						"assets:current:accounts receivable": [
							{
								"amount": -200
							}
						],
						"revenues:pending:sales": [
							{
								"amount": 200
							}
						],
						"revenues:primary:sales": [
							{
								"amount": -200
							}
						],
						"liabilities:current:salestax:received": [
							{
								"amount": 38
							}
						]
					}
				}
			});
		});
	});

});
