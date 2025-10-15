"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodDetails = void 0;
const index_1 = require("../index");
class PaymentMethodDetails {
    constructor(paymentMethodDetails) {
        this.type = paymentMethodDetails.type;
        this.card = paymentMethodDetails.card ? new index_1.PaymentCard(paymentMethodDetails.card) : null;
    }
}
exports.PaymentMethodDetails = PaymentMethodDetails;
