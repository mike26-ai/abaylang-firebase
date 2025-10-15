"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextTransactionAdjustmentItem = void 0;
const adjustment_1 = require("../adjustment");
class NextTransactionAdjustmentItem {
    constructor(adjustmentItem) {
        this.itemId = adjustmentItem.item_id;
        this.type = adjustmentItem.type;
        this.amount = adjustmentItem.amount ? adjustmentItem.amount : null;
        this.proration = adjustmentItem.proration ? new adjustment_1.AdjustmentProration(adjustmentItem.proration) : null;
        this.totals = adjustmentItem.totals ? new adjustment_1.AdjustmentItemTotals(adjustmentItem.totals) : null;
    }
}
exports.NextTransactionAdjustmentItem = NextTransactionAdjustmentItem;
