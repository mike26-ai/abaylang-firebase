"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionProration = void 0;
const index_1 = require("../index");
class TransactionProration {
    constructor(transactionProration) {
        this.rate = transactionProration.rate;
        this.billingPeriod = transactionProration.billing_period
            ? new index_1.TransactionsTimePeriod(transactionProration.billing_period)
            : null;
    }
}
exports.TransactionProration = TransactionProration;
