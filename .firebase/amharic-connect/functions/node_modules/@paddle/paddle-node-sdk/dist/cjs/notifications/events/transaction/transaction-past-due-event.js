"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPastDueEvent = void 0;
const event_1 = require("../../../entities/events/event");
const entities_1 = require("../../entities");
const helpers_1 = require("../../helpers");
class TransactionPastDueEvent extends event_1.Event {
    constructor(response) {
        super(response);
        this.eventType = helpers_1.EventName.TransactionPastDue;
        this.data = new entities_1.TransactionNotification(response.data);
    }
}
exports.TransactionPastDueEvent = TransactionPastDueEvent;
