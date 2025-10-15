"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionItemPreview = void 0;
const index_1 = require("../index");
class TransactionItemPreview {
    constructor(transactionItem) {
        var _a;
        this.price = transactionItem.price ? new index_1.Price(transactionItem.price) : null;
        this.quantity = transactionItem.quantity;
        this.includeInTotals = (_a = transactionItem.include_in_totals) !== null && _a !== void 0 ? _a : null;
        this.proration = transactionItem.proration ? new index_1.Proration(transactionItem.proration) : null;
    }
}
exports.TransactionItemPreview = TransactionItemPreview;
