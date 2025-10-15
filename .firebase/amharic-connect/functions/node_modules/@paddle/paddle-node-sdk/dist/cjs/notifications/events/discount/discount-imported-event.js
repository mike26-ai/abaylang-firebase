"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountImportedEvent = void 0;
const event_1 = require("../../../entities/events/event");
const entities_1 = require("../../entities");
const helpers_1 = require("../../helpers");
class DiscountImportedEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.DiscountImported;
        this.data = new entities_1.DiscountNotification(response.data);
    }
}
exports.DiscountImportedEvent = DiscountImportedEvent;
