"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionAdjustmentItem = void 0;
const index_1 = require("../index");
class TransactionAdjustmentItem {
    constructor(transactionAdjustmentItem) {
        this.id = transactionAdjustmentItem.id ? transactionAdjustmentItem.id : null;
        this.itemId = transactionAdjustmentItem.item_id;
        this.type = transactionAdjustmentItem.type;
        this.amount = transactionAdjustmentItem.amount ? transactionAdjustmentItem.amount : null;
        this.proration = transactionAdjustmentItem.proration
            ? new index_1.TransactionProration(transactionAdjustmentItem.proration)
            : null;
        this.totals = transactionAdjustmentItem.totals ? new index_1.AdjustmentItemTotals(transactionAdjustmentItem.totals) : null;
    }
}
exports.TransactionAdjustmentItem = TransactionAdjustmentItem;
