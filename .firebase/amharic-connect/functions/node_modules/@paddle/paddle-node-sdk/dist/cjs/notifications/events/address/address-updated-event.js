"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressUpdatedEvent = void 0;
const event_1 = require("../../../entities/events/event");
const helpers_1 = require("../../helpers");
const entities_1 = require("../../entities");
class AddressUpdatedEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.AddressUpdated;
        this.data = new entities_1.AddressNotification(response.data);
    }
}
exports.AddressUpdatedEvent = AddressUpdatedEvent;
