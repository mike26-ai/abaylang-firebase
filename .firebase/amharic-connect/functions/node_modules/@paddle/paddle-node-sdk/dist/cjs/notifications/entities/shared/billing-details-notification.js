"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingDetailsNotification = void 0;
const index_1 = require("../index");
class BillingDetailsNotification {
    constructor(billingDetails) {
        var _a;
        this.enableCheckout = (_a = billingDetails.enable_checkout) !== null && _a !== void 0 ? _a : null;
        this.purchaseOrderNumber = billingDetails.purchase_order_number ? billingDetails.purchase_order_number : null;
        this.additionalInformation = billingDetails.additional_information ? billingDetails.additional_information : null;
        this.paymentTerms = new index_1.TimePeriodNotification(billingDetails.payment_terms);
    }
}
exports.BillingDetailsNotification = BillingDetailsNotification;
