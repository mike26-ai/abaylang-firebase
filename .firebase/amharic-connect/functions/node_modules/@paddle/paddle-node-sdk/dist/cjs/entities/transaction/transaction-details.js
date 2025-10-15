"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDetails = void 0;
const index_1 = require("../index");
class TransactionDetails {
    constructor(transactionDetails) {
        this.taxRatesUsed = transactionDetails.tax_rates_used.map((tax_rates_used) => new index_1.TaxRatesUsed(tax_rates_used));
        this.totals = transactionDetails.totals ? new index_1.TransactionTotals(transactionDetails.totals) : null;
        this.adjustedTotals = transactionDetails.adjusted_totals
            ? new index_1.TransactionTotalsAdjusted(transactionDetails.adjusted_totals)
            : null;
        this.payoutTotals = transactionDetails.payout_totals
            ? new index_1.TransactionPayoutTotals(transactionDetails.payout_totals)
            : null;
        this.adjustedPayoutTotals = transactionDetails.adjusted_payout_totals
            ? new index_1.TransactionPayoutTotalsAdjusted(transactionDetails.adjusted_payout_totals)
            : null;
        this.lineItems = transactionDetails.line_items.map((line_item) => new index_1.TransactionLineItem(line_item));
    }
}
exports.TransactionDetails = TransactionDetails;
