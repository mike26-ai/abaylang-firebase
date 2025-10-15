"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTypesResource = void 0;
const base_1 = require("../../internal/base");
const entities_1 = require("../../entities");
const EventTypesPaths = {
    list: '/event-types',
};
class EventTypesResource extends base_1.BaseResource {
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get(EventTypesPaths.list);
            const data = this.handleResponse(response);
            return data.map((eventType) => new entities_1.EventType(eventType));
        });
    }
}
exports.EventTypesResource = EventTypesResource;
