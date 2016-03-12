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

	});

});
