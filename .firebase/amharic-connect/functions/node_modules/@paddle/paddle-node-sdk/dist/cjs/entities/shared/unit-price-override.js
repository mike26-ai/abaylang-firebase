"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitPriceOverride = void 0;
const index_1 = require("../index");
class UnitPriceOverride {
    constructor(unitPriceOverride) {
        this.countryCodes = unitPriceOverride.country_codes;
        this.unitPrice = new index_1.Money(unitPriceOverride.unit_price);
    }
}
exports.UnitPriceOverride = UnitPriceOverride;
