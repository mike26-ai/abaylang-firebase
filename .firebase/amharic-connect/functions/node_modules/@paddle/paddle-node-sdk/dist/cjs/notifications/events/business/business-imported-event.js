"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessImportedEvent = void 0;
const event_1 = require("../../../entities/events/event");
const entities_1 = require("../../entities");
const helpers_1 = require("../../helpers");
class BusinessImportedEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.BusinessImported;
        this.data = new entities_1.BusinessNotification(response.data);
    }
}
exports.BusinessImportedEvent = BusinessImportedEvent;
