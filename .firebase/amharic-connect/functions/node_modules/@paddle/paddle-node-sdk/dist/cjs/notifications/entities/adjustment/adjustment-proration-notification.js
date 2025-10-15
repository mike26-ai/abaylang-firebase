"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentProrationNotification = void 0;
const index_1 = require("../index");
class AdjustmentProrationNotification {
    constructor(adjustmentsProration) {
        this.rate = adjustmentsProration.rate;
        this.billingPeriod = adjustmentsProration.billing_period
            ? new index_1.AdjustmentTimePeriodNotification(adjustmentsProration.billing_period)
            : null;
    }
}
exports.AdjustmentProrationNotification = AdjustmentProrationNotification;
