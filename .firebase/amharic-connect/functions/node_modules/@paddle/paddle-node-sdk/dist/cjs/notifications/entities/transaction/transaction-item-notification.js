"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionItemNotification = void 0;
const index_1 = require("../index");
class TransactionItemNotification {
    constructor(transactionItem) {
        this.price = transactionItem.price ? new index_1.PriceNotification(transactionItem.price) : null;
        this.quantity = transactionItem.quantity;
        this.proration = transactionItem.proration ? new index_1.TransactionProrationNotification(transactionItem.proration) : null;
    }
}
exports.TransactionItemNotification = TransactionItemNotification;
