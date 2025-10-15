"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proration = void 0;
const index_1 = require("../index");
class Proration {
    constructor(prorationResponse) {
        this.rate = prorationResponse.rate;
        this.billingPeriod = new index_1.TransactionsTimePeriod(prorationResponse.billing_period);
    }
}
exports.Proration = Proration;
