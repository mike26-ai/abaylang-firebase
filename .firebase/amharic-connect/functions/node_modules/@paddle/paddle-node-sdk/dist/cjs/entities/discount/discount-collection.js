"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountCollection = void 0;
const discount_1 = require("./discount");
const base_1 = require("../../internal/base");
class DiscountCollection extends base_1.Collection {
    fromJson(data) {
        return new discount_1.Discount(data);
    }
}
exports.DiscountCollection = DiscountCollection;
