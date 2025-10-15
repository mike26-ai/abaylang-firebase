"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPreviewUpdateSummary = void 0;
const index_1 = require("../index");
class SubscriptionPreviewUpdateSummary {
    constructor(previewUpdateSummary) {
        this.credit = new index_1.Money(previewUpdateSummary.credit);
        this.charge = new index_1.Money(previewUpdateSummary.charge);
        this.result = new index_1.SubscriptionPreviewSummaryResult(previewUpdateSummary.result);
    }
}
exports.SubscriptionPreviewUpdateSummary = SubscriptionPreviewUpdateSummary;
