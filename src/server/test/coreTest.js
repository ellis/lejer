import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import {mergeTransaction} from '../src/core2.js';

const t01 = {
	data: "2012-04-01",
	description: "Sell shares",
	accounts: {
		"assets:cash": [{amount: 250000, bucket: "financing"}],
		"equity:common stock": [{amount: -25000}],
		"equity:additional paid-in capital": [{amount: -225000}],
	}
};

describe.only('core logic', () => {

	describe('mergeTransaction', () => {

		it('merges the transaction into state', () => {
			const state = Map();
			const nextState = mergeTransaction(state, "RelicSpotter", 1, t01);
			expect(nextState).to.equal(fromJS({
				transactions: {
					RelicSpotter: {
						"1": t01
					}
				}
			}));
		});
	});

});
