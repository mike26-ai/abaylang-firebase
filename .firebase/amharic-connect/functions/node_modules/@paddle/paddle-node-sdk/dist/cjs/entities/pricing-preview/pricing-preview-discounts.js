"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingPreviewDiscounts = void 0;
const index_1 = require("../index");
class PricingPreviewDiscounts {
    constructor(previewDiscount) {
        this.discount = new index_1.Discount(previewDiscount.discount);
        this.total = previewDiscount.total;
        this.formattedTotal = previewDiscount.formatted_total;
    }
}
exports.PricingPreviewDiscounts = PricingPreviewDiscounts;
