import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import {mergeTransaction} from '../src/core2.js';

const t01 = {
	date: "2012-04-01",
	description: "Sell shares",
	accounts: {
		"assets:cash": [{amount: 250000, tags: {"reports/cash/activity": "financing"}}],
		"equity:common stock": [{amount: -25000}],
		"equity:additional paid-in capital": [{amount: -225000}],
	}
};

describe.only('core logic', () => {

	describe('mergeTransaction', () => {

		it('merges the transaction into state', () => {
			const state0 = Map();
			const state = mergeTransaction(state0, "RelicSpotter", 1, t01);
			console.log(JSON.stringify(state, null, '\t'))
			expect(state).to.equal(fromJS({
				"transactions": {
					"RelicSpotter": {
						"1": {
							"date": "2012-04-01",
							"description": "Sell shares",
							"accounts": {
								"assets:cash": [ { "amount": 250000, "tags": { "reports/cash/activity": "financing" } } ],
								"equity:common stock": [ { "amount": -25000 } ],
								"equity:additional paid-in capital": [ { "amount": -225000 } ]
							}
						}
					}
				},
				"accountEntries": {
					"assets:cash": {
						"unadjusted": { "entries": { "1": 250000 }, "sum": 250000, "sumIn": 250000 }
					},
					"equity:common stock": {
						"unadjusted": { "entries": { "1": -25000 }, "sum": -25000, "sumOut": -25000 }
					},
					"equity:additional paid-in capital": {
						"unadjusted": { "entries": { "1": -225000 }, "sum": -225000, "sumOut": -225000 }
					}
				},
				"reports": {
					"cash": [
						{ "date": "2012-04-01", "cash": 250000, "financing": 250000 }
					]
				}
			}));
		});
	});

});
