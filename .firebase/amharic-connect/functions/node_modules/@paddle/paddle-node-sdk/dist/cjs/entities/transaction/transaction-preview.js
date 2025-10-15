"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPreview = void 0;
const index_1 = require("../index");
class TransactionPreview {
    constructor(transactionPreview) {
        var _a;
        this.customerId = transactionPreview.customer_id ? transactionPreview.customer_id : null;
        this.addressId = transactionPreview.address_id ? transactionPreview.address_id : null;
        this.businessId = transactionPreview.business_id ? transactionPreview.business_id : null;
        this.currencyCode = transactionPreview.currency_code;
        this.discountId = transactionPreview.discount_id ? transactionPreview.discount_id : null;
        this.customerIpAddress = transactionPreview.customer_ip_address ? transactionPreview.customer_ip_address : null;
        this.address = transactionPreview.address ? new index_1.AddressPreview(transactionPreview.address) : null;
        this.ignoreTrials = transactionPreview.ignore_trials ? transactionPreview.ignore_trials : null;
        this.items = transactionPreview.items.map((item) => new index_1.TransactionItemPreview(item));
        this.details = new index_1.TransactionDetailsPreview(transactionPreview.details);
        this.availablePaymentMethods = (_a = transactionPreview.available_payment_method) !== null && _a !== void 0 ? _a : null;
    }
}
exports.TransactionPreview = TransactionPreview;
