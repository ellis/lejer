import _ from 'lodash';
import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import * as Amount from '../lib/Amount.js';

const configEUR = {defaultCurrency: "EUR"};

describe('amount', () => {

	describe('normalize', () => {
		it("should normalize -42", () => {
			expect(Amount.normalize(-42)).to.deep.equal({"": -42});
		});

		it("should normalize '-42'", () => {
			expect(Amount.normalize('-42')).to.deep.equal({"": -42});
		});

		it("should normalize '-42 EUR'", () => {
			expect(Amount.normalize('-42 EUR')).to.deep.equal({"EUR": -42});
		});

		it("should normalize '84USD'", () => {
			expect(Amount.normalize('84USD')).to.deep.equal({"USD": 84});
		});

		it("should normalize 'EUR -42'", () => {
			expect(Amount.normalize('EUR -42')).to.deep.equal({"EUR": -42});
		});

		it("should normalize '-42€", () => {
			expect(Amount.normalize('-42€')).to.deep.equal({"€": -42});
		});

		it("should normalize '$-42", () => {
			expect(Amount.normalize('$-42')).to.deep.equal({"$": -42});
		});

		it("should normalize -42 with defaultCurrency=EUR", () => {
			expect(Amount.normalize(-42, configEUR)).to.deep.equal({"EUR": -42});
		});

		it("should normalize '-42' with defaultCurrency=EUR", () => {
			expect(Amount.normalize('-42', configEUR)).to.deep.equal({"EUR": -42});
		});

	});

	describe("add", () => {
		it("should add -42 + 84", () => {
			expect(Amount.add(-42, 84)).to.deep.equal(42);
		});

		it("should add -42 + 84 with defaultCurrency=EUR", () => {
			expect(Amount.add(-42, 84, configEUR)).to.deep.equal(42);
		});

		it("should add '-42' + '84'", () => {
			expect(Amount.add('-42', '84')).to.deep.equal({"": 42});
		});

		it("should add '-42' + '84' with defaultCurrency=EUR", () => {
			expect(Amount.add('-42', '84', configEUR)).to.deep.equal({"EUR": 42});
		});

		it("should add '-42 EUR' + '84EUR'", () => {
			expect(Amount.add('-42 EUR', '84EUR')).to.deep.equal({"EUR": 42});
		});

		it("should add '-42 EUR' + '84USD'", () => {
			expect(Amount.add('-42 EUR', '84USD')).to.deep.equal({"EUR": -42, "USD": 84});
		});

	});

	describe("subtract", () => {
		it("should subtract -42 - -84", () => {
			expect(Amount.subtract(-42, -84)).to.deep.equal(42);
		});

		it("should subtract '-42 EUR' - '-84EUR'", () => {
			expect(Amount.subtract('-42 EUR', '-84EUR')).to.deep.equal({"EUR": 42});
		});

	});

});
