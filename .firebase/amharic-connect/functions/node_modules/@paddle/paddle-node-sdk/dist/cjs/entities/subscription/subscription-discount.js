"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionDiscount = void 0;
class SubscriptionDiscount {
    constructor(subscriptionDiscount) {
        var _a;
        this.id = subscriptionDiscount.id;
        this.startsAt = subscriptionDiscount.starts_at;
        this.endsAt = (_a = subscriptionDiscount.ends_at) !== null && _a !== void 0 ? _a : null;
    }
}
exports.SubscriptionDiscount = SubscriptionDiscount;
