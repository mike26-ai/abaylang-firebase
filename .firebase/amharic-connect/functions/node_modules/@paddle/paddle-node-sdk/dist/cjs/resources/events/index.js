"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsResource = void 0;
const base_1 = require("../../internal/base");
const entities_1 = require("../../entities");
const EventPaths = {
    list: '/events',
};
__exportStar(require("./operations"), exports);
class EventsResource extends base_1.BaseResource {
    list(queryParams) {
        const queryParameters = new base_1.QueryParameters(queryParams);
        return new entities_1.EventCollection(this.client, EventPaths.list + queryParameters.toQueryString());
    }
}
exports.EventsResource = EventsResource;
