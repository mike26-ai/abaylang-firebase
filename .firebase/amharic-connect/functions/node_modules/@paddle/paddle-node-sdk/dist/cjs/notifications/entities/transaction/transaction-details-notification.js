"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDetailsNotification = void 0;
const index_1 = require("../index");
class TransactionDetailsNotification {
    constructor(transactionDetails) {
        this.taxRatesUsed = transactionDetails.tax_rates_used.map((tax_rates_used) => new index_1.TaxRatesUsedNotification(tax_rates_used));
        this.totals = transactionDetails.totals ? new index_1.TransactionTotalsNotification(transactionDetails.totals) : null;
        this.adjustedTotals = transactionDetails.adjusted_totals
            ? new index_1.TransactionTotalsAdjustedNotification(transactionDetails.adjusted_totals)
            : null;
        this.payoutTotals = transactionDetails.payout_totals
            ? new index_1.TransactionPayoutTotalsNotification(transactionDetails.payout_totals)
            : null;
        this.adjustedPayoutTotals = transactionDetails.adjusted_payout_totals
            ? new index_1.TransactionPayoutTotalsAdjustedNotification(transactionDetails.adjusted_payout_totals)
            : null;
        this.lineItems = transactionDetails.line_items.map((line_item) => new index_1.TransactionLineItemNotification(line_item));
    }
}
exports.TransactionDetailsNotification = TransactionDetailsNotification;
