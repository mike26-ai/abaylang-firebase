"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentProration = void 0;
const index_1 = require("../index");
class AdjustmentProration {
    constructor(adjustmentsProration) {
        this.rate = adjustmentsProration.rate;
        this.billingPeriod = adjustmentsProration.billing_period
            ? new index_1.AdjustmentTimePeriod(adjustmentsProration.billing_period)
            : null;
    }
}
exports.AdjustmentProration = AdjustmentProration;
