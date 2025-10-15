"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionLineItemPreview = void 0;
const index_1 = require("../index");
class TransactionLineItemPreview {
    constructor(transactionLineItemPreview) {
        this.priceId = transactionLineItemPreview.price_id;
        this.quantity = transactionLineItemPreview.quantity;
        this.taxRate = transactionLineItemPreview.tax_rate;
        this.unitTotals = new index_1.UnitTotals(transactionLineItemPreview.unit_totals);
        this.totals = new index_1.Totals(transactionLineItemPreview.totals);
        this.product = new index_1.Product(transactionLineItemPreview.product);
    }
}
exports.TransactionLineItemPreview = TransactionLineItemPreview;
