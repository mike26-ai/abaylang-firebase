"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceUpdatedEvent = void 0;
const event_1 = require("../../../entities/events/event");
const entities_1 = require("../../entities");
const helpers_1 = require("../../helpers");
class PriceUpdatedEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.PriceUpdated;
        this.data = new entities_1.PriceNotification(response.data);
    }
}
exports.PriceUpdatedEvent = PriceUpdatedEvent;
