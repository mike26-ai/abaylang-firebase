"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitPriceOverrideNotification = void 0;
const index_1 = require("../index");
class UnitPriceOverrideNotification {
    constructor(unitPriceOverride) {
        this.countryCodes = unitPriceOverride.country_codes;
        this.unitPrice = new index_1.MoneyNotification(unitPriceOverride.unit_price);
    }
}
exports.UnitPriceOverrideNotification = UnitPriceOverrideNotification;
