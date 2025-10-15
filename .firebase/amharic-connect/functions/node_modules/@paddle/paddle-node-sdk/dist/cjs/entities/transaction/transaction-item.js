"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionItem = void 0;
const index_1 = require("../index");
class TransactionItem {
    constructor(transactionItem) {
        this.price = transactionItem.price ? new index_1.Price(transactionItem.price) : null;
        this.quantity = transactionItem.quantity;
        this.proration = transactionItem.proration ? new index_1.TransactionProration(transactionItem.proration) : null;
    }
}
exports.TransactionItem = TransactionItem;
