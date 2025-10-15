"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCollection = void 0;
const base_1 = require("../../internal/base");
const notification_1 = require("./notification");
class NotificationCollection extends base_1.Collection {
    fromJson(data) {
        return new notification_1.Notification(data);
    }
}
exports.NotificationCollection = NotificationCollection;
