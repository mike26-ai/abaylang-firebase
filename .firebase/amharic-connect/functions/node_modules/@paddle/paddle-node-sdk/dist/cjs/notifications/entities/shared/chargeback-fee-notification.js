"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackFeeNotification = void 0;
const index_1 = require("../index");
class ChargebackFeeNotification {
    constructor(chargebackFee) {
        this.amount = chargebackFee.amount;
        this.original = chargebackFee.original ? new index_1.AdjustmentOriginalAmountNotification(chargebackFee.original) : null;
    }
}
exports.ChargebackFeeNotification = ChargebackFeeNotification;
