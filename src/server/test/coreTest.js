import _ from 'lodash';
import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import {mergeTransaction} from '../src/core2.js';

const RelicSpotter = {
	"01": {
		id: "01",
		date: "2012-04-01",
		description: "Sell shares",
		accounts: {
			"assets:current:cash": [{amount: 250000, tags: {"reports/cash/activity": "financing"}}],
			"equity:common stock": [{amount: -25000}],
			"equity:additional paid-in capital": [{amount: -225000}],
		}
	},
	"03": {
		id: "03",
		date: "2012-04-02",
		description: "Legal fees",
		accounts: {
			"assets:current:cash": [{amount: -3900, tags: {"reports/cash/activity": "operating"}}],
			"expenses:period:legal fees": [{amount: 3900}]
		}
	},
	"04": {
		id: "04",
		date: "2012-04-07",
		description: "Buy building and land",
		accounts: {
			"assets:current:cash": [{amount: 124000, tags: {"reports/cash/activity": "financing"}}, {amount: -155000, tags: {"reports/cash/activity": "investing"}}],
			"liabilities:long-term:mortgage payable": [{amount: -124000}],
			"assets:long-term:buildings": [{amount: 52000}],
			"assets:long-term:land": [{amount: 103000}]
		}
	},
	"05": {
		id: "05",
		date: "2012-05-25",
		description: "Building renovation",
		comment: "intended to increase building value",
		accounts: {
			"assets:current:cash": [{amount: -33000, tags: {"reports/cash/activity": "investing"}}],
			"assets:long-term:buildings": [{amount: 33000}],
		}
	},
	"06": {
		id: "06",
		date: "2012-06-02",
		description: "Buy metal detectors",
		comment: "expected life of 2 years",
		accounts: {
			"assets:current:cash": [{amount: -120000, tags: {"reports/cash/activity": "investing"}}],
			"assets:long-term:equipment": [{amount: 120000}],
		}
	},
	"07": {
		id: "07",
		date: "2012-06-30",
		description: "Buy sundries",
		accounts: {
			"assets:current:inventory": [{amount: 2000}],
			"liabilities:current:accounts payable": [{amount: -2000}],
		}
	},
	"08": {
		id: "08",
		date: "2012-06-30",
		description: "Pay for software site license",
		comment: "three year software license",
		accounts: {
			"assets:current:cash": [{amount: -2100, tags: {"reports/cash/activity": "investing"}],
			"assets:intangible:prepaid software": [{amount: 2100}],
		}
	},
	"09": {
		id: "09",
		date: "2012-06-30",
		description: "Buy advertising",
		comment: "prepay for 1 year",
		accounts: {
			"assets:current:cash": [{amount: -8000, tags: {"reports/cash/activity": "operating"}],
			"assets:current:prepaid advertising": [{amount: 8000}],
		}
	},
	"10": {
		id: "10",
		date: "2012-06-30",
		description: "Loan to Park",
		comment: "She has one year to repay",
		accounts: {
			"assets:current:cash": [{amount: -5000, tags: {"reports/cash/activity": "operating"}],
			"assets:current:notes receivable": [{amount: 5000}]
		}
	},
	"12": {
		id: "12",
		date: "2012-06-30",
		description: "Declare dividends",
		accounts: {
			"equity:retained earnings": [{amount: 2500}],
			"liabilities:current:dividends payable": [{amount: -2500}]
		}
	},
	"13": {
		id: "13",
		date: "2012-07-31",
		description: "Pay supplier",
		comment: "Pay for inventory bought in transaction 7",
		accounts: {
			"assets:current:cash": [{amount: -2000, tags: {"reports/cash/activity": "operating"}],
			"liabilities:current:accounts payable": [{amount: 2000}],
		}
	},
	"14": {
		id: "14",
		date: "2012-08-31",
		description: "Pay dividend",
		accounts: {
			"assets:current:cash": [{amount: -2500, tags: {"reports/cash/activity": "financing"}],
			"liabilities:current:dividends payable": [{amount: 2500}],
		}
	},
	"15": {
		id: "15",
		date: "2012-12-01",
		description: "Sell pre-paid rentals",
		comment: "received pre-paid rentals for following year",
		accounts: {
			"assets:current:cash": [{amount: 1200, tags: {"reports/cash/activity": "operating"}],
			"liabilities:current:unearned rental revenue": [{amount: -1200}],
		}
	},
	"16": {
		id: "16",
		date: "2012-12-31",
		description: "Receive rental revenue",
		accounts: {
			"assets:current:cash": [{amount: 120100, tags: {"reports/cash/activity": "operating"}],
			"assets:current:accounts receivable": [{amount: 4200}],
			"revenues:primary:rental": [{amount: -124300}],
		}
	},
	"17": {
		id: "17",
		date: "2012-12-31",
		description: "Pay for inventory",
		accounts: {
			"assets:current:cash": [{amount: -38000, tags: {"reports/cash/activity": "operating"}],
			"liabilities:current:accounts payable": [{amount: -2000}],
			"assets:current:inventory": [{amount: 40000}],
		}
	},
	"18": {
		id: "18",
		date: "2012-12-31",
		description: "Sales of sundries",
		accounts: {
			"assets:current:cash": [{amount: 35000, tags: {"reports/cash/activity": "operating"}],
			"revenues:primary:sales": [{amount: -35000}],
		}
	},
	"19": {
		id: "19",
		description: "Cost of sundries sold",
		date: "2012-12-31",
		accounts: {
			"assets:current:inventory": [{amount: -30000}],
			"expenses:primary:cost of goods sold": [{amount: 30000}],
		}
	},
	"20": {
		id: "20",
		description: "Pay salaries",
		date: "2012-12-31",
		accounts: {
			"assets:current:cash": [{amount: -82000, tags: {"reports/cash/activity": "operating"}],
			"expenses:period:salaries": [{amount: 82000}],
		}
	},
	"21": {
		id: "21",
		transactionType: "adjusting",
		description: "Accrued interest",
		date: "2012-12-31",
		accounts: {
			"liabilities:current:interest": [{amount: -4900}],
			"expenses:secondary:interest": [{amount: 4900}]
		}
	}
	"22": {
		phase: "adjusting",
		description: "Depreciation on building",
		date: "2012-12-31",
		accounts: {
			"assets:depreciable:accumulated depreciation": [{amount: -1500}],
			"expenses:depreciation:buildings": [{amount: 1500}]
		}
	},
	"23": {
		phase: "adjusting",
		description: "Depreciation on metal detectors",
		date: "2012-12-31",
		accounts: {
			"assets:depreciable:accumulated depreciation": [{amount: -30000}],
			"expenses:depreciation:equipment": [{amount: 30000}]
		}
	},
	"24": {
		phase: "adjusting",
		description: "Amortization on software license, see #8",
		date: "2012-12-31",
		accounts: {
			"assets:prepaid software": [{amount: -350}],
			"expenses:software amortization": [{amount: 350}]
		}
	},
	"25": {
		phase: "adjusting",
		description: "Expense prepaid advertising, see #9",
		date: "2012-12-31",
		accounts: {
			"assets:prepaid advertising": [{amount: -4000}],
			"expenses:advertising": [{amount: 4000}]
		}
	},
	"26": {
		phase: "adjusting",
		description: "Accumulated interest receivable, see #10",
		date: "2012-12-31",
		accounts: {
			"revenues:interest": [{amount: -250}],
			"assets:interest receivable": [{amount: 250}]
		}
	},
	"27": {
		phase: "adjusting",
		description: "Earning of unearned revenues, see #15",
		date: "2012-12-31",
		accounts: {
			"revenues:rental": [{amount: -100}],
			"liabilities:unearned rental revenue": [{amount: 100}]
		}
	},
	"28": {
		phase: "adjusting",
		description: "Estimated income taxes",
		date: "2012-12-31",
		accounts: {
			"liabilities:income taxes payable": [{amount: -630}],
			"expenses:income taxes": [{amount: 630}],
		}
	},
};

describe('core logic', () => {

	describe('mergeTransaction', () => {

		it('merges transaction 01 into state', () => {
			const ids = ["01"];
			const state = _.reduce(ids, (state, id) => mergeTransaction(state, "RelicSpotter", id, RelicSpotter[id]), Map());
			// console.log(JSON.stringify(state, null, '\t'))
			expect(state.toJS()).to.deep.equal({
				"transactions": {
					"RelicSpotter": _.pick(RelicSpotter, ids)
				},
				"accountEntries": {
					"assets:current:cash": {
						"unadjusted": { "entries": { "01": 250000 }, "sum": 250000, "sumIn": 250000 }
					},
					"equity:common stock": {
						"unadjusted": { "entries": { "01": -25000 }, "sum": -25000, "sumOut": -25000 }
					},
					"equity:additional paid-in capital": {
						"unadjusted": { "entries": { "01": -225000 }, "sum": -225000, "sumOut": -225000 }
					}
				},
				"reports": {
					"cash": {
						"2012": [
							{ "id": "01", "date": "2012-04-01", "cash": 250000, "financing": 250000 }
						]
					},
					"income": {
						"2012": {}
					}
				}
			});
		});

		it('merges transaction 03 into state', () => {
			const ids = ["01", "03"];
			const state = _.reduce(ids, (state, id) => mergeTransaction(state, "RelicSpotter", id, RelicSpotter[id]), Map());
			// console.log(JSON.stringify(state, null, '\t'))
			expect(state.toJS()).to.deep.equal({
				"transactions": {
					"RelicSpotter": _.pick(RelicSpotter, ids)
				},
				"accountEntries": {
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
				},
				"reports": {
					"cash": {
						"2012": [
							{ "date": "2012-04-01", "id": "01", "cash": 250000, "financing": 250000 },
							{ "date": "2012-04-02", "id": "03", "cash": -3900, "operating": -3900 }
						]
					},
					"income": {
						"2012": {
							"periodExpenses": {
								"accounts": {
									"legal fees": -3900
								},
								"total": -3900
							}
						}
					}
				}
			});
		});

		it('merges transaction 04 into state', () => {
			const ids = ["01", "03", "04"];
			const state = _.reduce(ids, (state, id) => mergeTransaction(state, "RelicSpotter", id, RelicSpotter[id]), Map());
			// console.log(JSON.stringify(state, null, '\t'))
			expect(state.toJS()).to.deep.equal({
				"transactions": {
					"RelicSpotter": _.pick(RelicSpotter, ids)
				},
				"accountEntries": {
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
				},
				"reports": {
					"cash": {
						"2012": [
							{ "date": "2012-04-01", "id": "01", "cash": 250000, "financing": 250000 },
							{ "date": "2012-04-02", "id": "03", "cash": -3900, "operating": -3900 },
							{ "date": "2012-04-07", "id": "04", "cash": 124000, "financing": 124000 },
							{ "date": "2012-04-07", "id": "04", "cash": -155000, "investing": -155000 },
						]
					},
					"income": {
						"2012": {
							"periodExpenses": {
								"accounts": {
									"legal fees": -3900
								},
								"total": -3900
							}
						}
					}
				}
			});
		});

	});

});
