"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutTotalsAdjustment = void 0;
const index_1 = require("../index");
class PayoutTotalsAdjustment {
    constructor(payoutTotalsAdjustment) {
        this.subtotal = payoutTotalsAdjustment.subtotal;
        this.tax = payoutTotalsAdjustment.tax;
        this.total = payoutTotalsAdjustment.total;
        this.fee = payoutTotalsAdjustment.fee;
        this.chargebackFee = payoutTotalsAdjustment.chargeback_fee
            ? new index_1.ChargebackFee(payoutTotalsAdjustment.chargeback_fee)
            : null;
        this.earnings = payoutTotalsAdjustment.earnings;
        this.currencyCode = payoutTotalsAdjustment.currency_code;
    }
}
exports.PayoutTotalsAdjustment = PayoutTotalsAdjustment;
