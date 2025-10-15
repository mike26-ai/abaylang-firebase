"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventCollection = void 0;
const base_1 = require("../../internal/base");
const notifications_1 = require("../../notifications");
class EventCollection extends base_1.Collection {
    fromJson(data) {
        return notifications_1.Webhooks.fromJson(data);
    }
}
exports.EventCollection = EventCollection;
