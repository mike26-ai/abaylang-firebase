"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionCollection = void 0;
const subscription_1 = require("./subscription");
const base_1 = require("../../internal/base");
class SubscriptionCollection extends base_1.Collection {
    fromJson(data) {
        return new subscription_1.Subscription(data);
    }
}
exports.SubscriptionCollection = SubscriptionCollection;
