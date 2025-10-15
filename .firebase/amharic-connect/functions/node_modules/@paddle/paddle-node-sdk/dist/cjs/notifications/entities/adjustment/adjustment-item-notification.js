"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentItemNotification = void 0;
const index_1 = require("../index");
class AdjustmentItemNotification {
    constructor(adjustmentItem) {
        this.id = adjustmentItem.id;
        this.itemId = adjustmentItem.item_id;
        this.type = adjustmentItem.type;
        this.amount = adjustmentItem.amount ? adjustmentItem.amount : null;
        this.proration = adjustmentItem.proration ? new index_1.AdjustmentProrationNotification(adjustmentItem.proration) : null;
        this.totals = adjustmentItem.totals ? new index_1.AdjustmentItemTotalsNotification(adjustmentItem.totals) : null;
    }
}
exports.AdjustmentItemNotification = AdjustmentItemNotification;
