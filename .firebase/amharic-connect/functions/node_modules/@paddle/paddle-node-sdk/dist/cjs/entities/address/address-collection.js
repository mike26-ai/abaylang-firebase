"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressCollection = void 0;
const address_1 = require("./address");
const base_1 = require("../../internal/base");
class AddressCollection extends base_1.Collection {
    fromJson(data) {
        return new address_1.Address(data);
    }
}
exports.AddressCollection = AddressCollection;
