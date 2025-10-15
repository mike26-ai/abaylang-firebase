"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductUpdatedEvent = void 0;
const event_1 = require("../../../entities/events/event");
const entities_1 = require("../../entities");
const helpers_1 = require("../../helpers");
class ProductUpdatedEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.ProductUpdated;
        this.data = new entities_1.ProductNotification(response.data);
    }
}
exports.ProductUpdatedEvent = ProductUpdatedEvent;
