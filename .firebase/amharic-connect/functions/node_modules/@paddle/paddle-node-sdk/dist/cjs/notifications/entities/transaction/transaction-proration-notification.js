"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionProrationNotification = void 0;
const index_1 = require("../index");
class TransactionProrationNotification {
    constructor(transactionProration) {
        this.rate = transactionProration.rate;
        this.billingPeriod = transactionProration.billing_period
            ? new index_1.TransactionsTimePeriodNotification(transactionProration.billing_period)
            : null;
    }
}
exports.TransactionProrationNotification = TransactionProrationNotification;
