"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const index_1 = require("../index");
class Subscription {
    constructor(subscription) {
        this.id = subscription.id;
        this.status = subscription.status;
        this.customerId = subscription.customer_id;
        this.addressId = subscription.address_id;
        this.businessId = subscription.business_id ? subscription.business_id : null;
        this.currencyCode = subscription.currency_code;
        this.createdAt = subscription.created_at;
        this.updatedAt = subscription.updated_at;
        this.startedAt = subscription.started_at ? subscription.started_at : null;
        this.firstBilledAt = subscription.first_billed_at ? subscription.first_billed_at : null;
        this.nextBilledAt = subscription.next_billed_at ? subscription.next_billed_at : null;
        this.pausedAt = subscription.paused_at ? subscription.paused_at : null;
        this.canceledAt = subscription.canceled_at ? subscription.canceled_at : null;
        this.discount = subscription.discount ? new index_1.SubscriptionDiscount(subscription.discount) : null;
        this.collectionMode = subscription.collection_mode;
        this.billingDetails = subscription.billing_details ? new index_1.BillingDetails(subscription.billing_details) : null;
        this.currentBillingPeriod = subscription.current_billing_period
            ? new index_1.SubscriptionTimePeriod(subscription.current_billing_period)
            : null;
        this.billingCycle = new index_1.TimePeriod(subscription.billing_cycle);
        this.scheduledChange = subscription.scheduled_change
            ? new index_1.SubscriptionScheduledChange(subscription.scheduled_change)
            : null;
        this.managementUrls = subscription.management_urls
            ? new index_1.SubscriptionManagement(subscription.management_urls)
            : null;
        this.items = subscription.items.map((item) => new index_1.SubscriptionItem(item));
        this.customData = subscription.custom_data ? subscription.custom_data : null;
        this.importMeta = subscription.import_meta ? new index_1.ImportMeta(subscription.import_meta) : null;
        this.nextTransaction = subscription.next_transaction ? new index_1.NextTransaction(subscription.next_transaction) : null;
        this.recurringTransactionDetails = subscription.recurring_transaction_details
            ? new index_1.TransactionDetailsPreview(subscription.recurring_transaction_details)
            : null;
    }
}
exports.Subscription = Subscription;
