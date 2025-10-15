"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRatesUsed = void 0;
const index_1 = require("../index");
class TaxRatesUsed {
    constructor(taxRatesUsed) {
        this.taxRate = taxRatesUsed.tax_rate;
        this.totals = taxRatesUsed.totals ? new index_1.Totals(taxRatesUsed.totals) : null;
    }
}
exports.TaxRatesUsed = TaxRatesUsed;
