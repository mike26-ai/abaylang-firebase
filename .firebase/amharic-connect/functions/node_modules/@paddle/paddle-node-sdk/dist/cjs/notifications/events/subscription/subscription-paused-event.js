"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPausedEvent = void 0;
const event_1 = require("../../../entities/events/event");
const entities_1 = require("../../entities");
const helpers_1 = require("../../helpers");
class SubscriptionPausedEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.SubscriptionPaused;
        this.data = new entities_1.SubscriptionNotification(response.data);
    }
}
exports.SubscriptionPausedEvent = SubscriptionPausedEvent;
