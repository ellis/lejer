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
