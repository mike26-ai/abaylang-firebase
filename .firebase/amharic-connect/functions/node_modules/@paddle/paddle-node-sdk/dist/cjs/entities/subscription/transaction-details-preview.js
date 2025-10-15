"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDetailsPreview = void 0;
const index_1 = require("../index");
class TransactionDetailsPreview {
    constructor(transactionDetailsPreview) {
        this.taxRatesUsed = transactionDetailsPreview.tax_rates_used.map((tax_rates_used) => new index_1.TaxRatesUsed(tax_rates_used));
        this.totals = new index_1.TransactionTotals(transactionDetailsPreview.totals);
        this.lineItems = transactionDetailsPreview.line_items.map((line_item) => new index_1.TransactionLineItemPreview(line_item));
    }
}
exports.TransactionDetailsPreview = TransactionDetailsPreview;
