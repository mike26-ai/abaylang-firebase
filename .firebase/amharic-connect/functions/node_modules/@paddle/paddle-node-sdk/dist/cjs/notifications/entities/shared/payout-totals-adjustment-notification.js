"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutTotalsAdjustmentNotification = void 0;
const index_1 = require("../index");
class PayoutTotalsAdjustmentNotification {
    constructor(payoutTotalsAdjustment) {
        this.subtotal = payoutTotalsAdjustment.subtotal;
        this.tax = payoutTotalsAdjustment.tax;
        this.total = payoutTotalsAdjustment.total;
        this.fee = payoutTotalsAdjustment.fee;
        this.chargebackFee = payoutTotalsAdjustment.chargeback_fee
            ? new index_1.ChargebackFeeNotification(payoutTotalsAdjustment.chargeback_fee)
            : null;
        this.earnings = payoutTotalsAdjustment.earnings;
        this.currencyCode = payoutTotalsAdjustment.currency_code;
    }
}
exports.PayoutTotalsAdjustmentNotification = PayoutTotalsAdjustmentNotification;
