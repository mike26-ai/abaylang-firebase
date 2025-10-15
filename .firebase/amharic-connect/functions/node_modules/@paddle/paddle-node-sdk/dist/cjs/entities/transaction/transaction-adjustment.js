"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionAdjustment = void 0;
const index_1 = require("../index");
class TransactionAdjustment {
    constructor(adjustment) {
        this.id = adjustment.id;
        this.action = adjustment.action;
        this.transactionId = adjustment.transaction_id;
        this.subscriptionId = adjustment.subscription_id ? adjustment.subscription_id : null;
        this.customerId = adjustment.customer_id;
        this.reason = adjustment.reason;
        this.creditAppliedToBalance = adjustment.credit_applied_to_balance;
        this.currencyCode = adjustment.currency_code;
        this.status = adjustment.status;
        this.items = adjustment.items.map((item) => new index_1.TransactionAdjustmentItem(item));
        this.totals = adjustment.totals ? new index_1.TotalAdjustments(adjustment.totals) : null;
        this.payoutTotals = adjustment.payout_totals ? new index_1.PayoutTotalsAdjustment(adjustment.payout_totals) : null;
        this.createdAt = adjustment.created_at;
        this.updatedAt = adjustment.updated_at;
    }
}
exports.TransactionAdjustment = TransactionAdjustment;
