"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackFee = void 0;
const index_1 = require("../index");
class ChargebackFee {
    constructor(chargebackFee) {
        this.amount = chargebackFee.amount;
        this.original = chargebackFee.original ? new index_1.AdjustmentOriginalAmount(chargebackFee.original) : null;
    }
}
exports.ChargebackFee = ChargebackFee;
