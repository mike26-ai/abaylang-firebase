"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingPreviewLineItem = void 0;
const price_1 = require("../price");
const shared_1 = require("../shared");
const product_1 = require("../product");
const pricing_preview_discounts_1 = require("./pricing-preview-discounts");
class PricingPreviewLineItem {
    constructor(lineItem) {
        this.price = new price_1.Price(lineItem.price);
        this.quantity = lineItem.quantity;
        this.taxRate = lineItem.tax_rate;
        this.unitTotals = new shared_1.Totals(lineItem.unit_totals);
        this.formattedUnitTotals = new shared_1.Totals(lineItem.formatted_unit_totals);
        this.totals = new shared_1.Totals(lineItem.totals);
        this.formattedTotals = new shared_1.Totals(lineItem.formatted_totals);
        this.product = new product_1.Product(lineItem.product);
        this.discounts = lineItem.discounts.map((discount) => new pricing_preview_discounts_1.PricingPreviewDiscounts(discount));
    }
}
exports.PricingPreviewLineItem = PricingPreviewLineItem;
