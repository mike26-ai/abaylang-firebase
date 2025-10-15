"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPreview = void 0;
const index_1 = require("../index");
class SubscriptionPreview {
    constructor(subscriptionPreview) {
        this.status = subscriptionPreview.status;
        this.customerId = subscriptionPreview.customer_id;
        this.addressId = subscriptionPreview.address_id;
        this.businessId = subscriptionPreview.business_id ? subscriptionPreview.business_id : null;
        this.currencyCode = subscriptionPreview.currency_code;
        this.createdAt = subscriptionPreview.created_at;
        this.updatedAt = subscriptionPreview.updated_at;
        this.startedAt = subscriptionPreview.started_at ? subscriptionPreview.started_at : null;
        this.firstBilledAt = subscriptionPreview.first_billed_at ? subscriptionPreview.first_billed_at : null;
        this.nextBilledAt = subscriptionPreview.next_billed_at ? subscriptionPreview.next_billed_at : null;
        this.pausedAt = subscriptionPreview.paused_at ? subscriptionPreview.paused_at : null;
        this.canceledAt = subscriptionPreview.canceled_at ? subscriptionPreview.canceled_at : null;
        this.discount = subscriptionPreview.discount ? new index_1.SubscriptionDiscount(subscriptionPreview.discount) : null;
        this.collectionMode = subscriptionPreview.collection_mode;
        this.billingDetails = subscriptionPreview.billing_details
            ? new index_1.BillingDetails(subscriptionPreview.billing_details)
            : null;
        this.currentBillingPeriod = subscriptionPreview.current_billing_period
            ? new index_1.SubscriptionTimePeriod(subscriptionPreview.current_billing_period)
            : null;
        this.billingCycle = subscriptionPreview.billing_cycle ? new index_1.TimePeriod(subscriptionPreview.billing_cycle) : null;
        this.scheduledChange = subscriptionPreview.scheduled_change
            ? new index_1.SubscriptionScheduledChange(subscriptionPreview.scheduled_change)
            : null;
        this.managementUrls = subscriptionPreview.management_urls
            ? new index_1.SubscriptionManagement(subscriptionPreview.management_urls)
            : null;
        this.items = subscriptionPreview.items.map((item) => new index_1.SubscriptionItem(item));
        this.customData = subscriptionPreview.custom_data ? subscriptionPreview.custom_data : null;
        this.immediateTransaction = subscriptionPreview.immediate_transaction
            ? new index_1.NextTransaction(subscriptionPreview.immediate_transaction)
            : null;
        this.nextTransaction = subscriptionPreview.next_transaction
            ? new index_1.NextTransaction(subscriptionPreview.next_transaction)
            : null;
        this.recurringTransactionDetails = subscriptionPreview.recurring_transaction_details
            ? new index_1.TransactionDetailsPreview(subscriptionPreview.recurring_transaction_details)
            : null;
        this.updateSummary = subscriptionPreview.update_summary
            ? new index_1.SubscriptionPreviewUpdateSummary(subscriptionPreview.update_summary)
            : null;
        this.importMeta = subscriptionPreview.import_meta ? new index_1.ImportMeta(subscriptionPreview.import_meta) : null;
    }
}
exports.SubscriptionPreview = SubscriptionPreview;
