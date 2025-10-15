"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextTransaction = void 0;
const index_1 = require("../index");
class NextTransaction {
    constructor(nextTransaction) {
        this.billingPeriod = new index_1.SubscriptionTimePeriod(nextTransaction.billing_period);
        this.details = new index_1.TransactionDetailsPreview(nextTransaction.details);
        this.adjustments = nextTransaction.adjustments.map((adjustment) => new index_1.NextTransactionAdjustmentPreview(adjustment));
    }
}
exports.NextTransaction = NextTransaction;
