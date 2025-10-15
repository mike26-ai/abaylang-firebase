"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRatesUsedNotification = void 0;
const index_1 = require("../index");
class TaxRatesUsedNotification {
    constructor(taxRatesUsed) {
        this.taxRate = taxRatesUsed.tax_rate;
        this.totals = taxRatesUsed.totals ? new index_1.TotalsNotification(taxRatesUsed.totals) : null;
    }
}
exports.TaxRatesUsedNotification = TaxRatesUsedNotification;
