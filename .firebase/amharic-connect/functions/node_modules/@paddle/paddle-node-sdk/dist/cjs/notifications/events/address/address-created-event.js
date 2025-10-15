"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressCreatedEvent = void 0;
const helpers_1 = require("../../helpers");
const event_1 = require("../../../entities/events/event");
const entities_1 = require("../../entities");
class AddressCreatedEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.AddressCreated;
        this.data = new entities_1.AddressNotification(response.data);
    }
}
exports.AddressCreatedEvent = AddressCreatedEvent;
