"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPayoutTotalsAdjusted = void 0;
const index_1 = require("../index");
class TransactionPayoutTotalsAdjusted {
    constructor(transactionPayoutTotalsAdjusted) {
        this.subtotal = transactionPayoutTotalsAdjusted.subtotal;
        this.tax = transactionPayoutTotalsAdjusted.tax;
        this.total = transactionPayoutTotalsAdjusted.total;
        this.fee = transactionPayoutTotalsAdjusted.fee;
        this.chargebackFee = transactionPayoutTotalsAdjusted.chargeback_fee
            ? new index_1.ChargebackFee(transactionPayoutTotalsAdjusted.chargeback_fee)
            : null;
        this.earnings = transactionPayoutTotalsAdjusted.earnings;
        this.currencyCode = transactionPayoutTotalsAdjusted.currency_code;
    }
}
exports.TransactionPayoutTotalsAdjusted = TransactionPayoutTotalsAdjusted;
