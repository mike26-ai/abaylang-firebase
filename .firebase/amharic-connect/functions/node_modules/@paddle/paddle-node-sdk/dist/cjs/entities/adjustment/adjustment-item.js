"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentItem = void 0;
const index_1 = require("../index");
class AdjustmentItem {
    constructor(adjustmentItem) {
        this.id = adjustmentItem.id;
        this.itemId = adjustmentItem.item_id;
        this.type = adjustmentItem.type;
        this.amount = adjustmentItem.amount ? adjustmentItem.amount : null;
        this.proration = adjustmentItem.proration ? new index_1.AdjustmentProration(adjustmentItem.proration) : null;
        this.totals = adjustmentItem.totals ? new index_1.AdjustmentItemTotals(adjustmentItem.totals) : null;
    }
}
exports.AdjustmentItem = AdjustmentItem;
