"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentTotals = void 0;
const index_1 = require("../index");
class AdjustmentTotals {
    constructor(adjustmentTotals) {
        this.subtotal = adjustmentTotals.subtotal;
        this.tax = adjustmentTotals.tax;
        this.total = adjustmentTotals.total;
        this.fee = adjustmentTotals.fee;
        this.earnings = adjustmentTotals.earnings;
        this.breakdown = adjustmentTotals.breakdown ? new index_1.AdjustmentTotalsBreakdown(adjustmentTotals.breakdown) : null;
        this.currencyCode = adjustmentTotals.currency_code;
    }
}
exports.AdjustmentTotals = AdjustmentTotals;
