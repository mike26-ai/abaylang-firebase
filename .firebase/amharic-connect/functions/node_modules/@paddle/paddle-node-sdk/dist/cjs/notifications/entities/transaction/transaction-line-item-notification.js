"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionLineItemNotification = void 0;
const index_1 = require("../index");
class TransactionLineItemNotification {
    constructor(transactionLineItem) {
        this.id = transactionLineItem.id;
        this.priceId = transactionLineItem.price_id;
        this.quantity = transactionLineItem.quantity;
        this.proration = transactionLineItem.proration
            ? new index_1.TransactionProrationNotification(transactionLineItem.proration)
            : null;
        this.taxRate = transactionLineItem.tax_rate;
        this.unitTotals = transactionLineItem.unit_totals
            ? new index_1.UnitTotalsNotification(transactionLineItem.unit_totals)
            : null;
        this.totals = transactionLineItem.totals ? new index_1.TotalsNotification(transactionLineItem.totals) : null;
        this.product = transactionLineItem.product ? new index_1.ProductNotification(transactionLineItem.product) : null;
    }
}
exports.TransactionLineItemNotification = TransactionLineItemNotification;
