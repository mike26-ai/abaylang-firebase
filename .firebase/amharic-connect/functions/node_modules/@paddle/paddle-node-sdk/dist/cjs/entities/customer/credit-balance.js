"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditBalance = void 0;
const index_1 = require("../index");
class CreditBalance {
    constructor(creditBalance) {
        this.customerId = creditBalance.customer_id ? creditBalance.customer_id : null;
        this.currencyCode = creditBalance.currency_code ? creditBalance.currency_code : null;
        this.balance = creditBalance.balance ? new index_1.CustomerBalance(creditBalance.balance) : null;
    }
}
exports.CreditBalance = CreditBalance;
