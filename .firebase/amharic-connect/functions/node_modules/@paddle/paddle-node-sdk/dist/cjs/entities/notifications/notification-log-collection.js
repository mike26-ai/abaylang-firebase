"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationLogCollection = void 0;
const base_1 = require("../../internal/base");
const notification_log_1 = require("./notification-log");
class NotificationLogCollection extends base_1.Collection {
    fromJson(data) {
        return new notification_log_1.NotificationLog(data);
    }
}
exports.NotificationLogCollection = NotificationLogCollection;
