"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCollection = void 0;
const customer_1 = require("./customer");
const base_1 = require("../../internal/base");
class CustomerCollection extends base_1.Collection {
    fromJson(data) {
        return new customer_1.Customer(data);
    }
}
exports.CustomerCollection = CustomerCollection;
