"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceCollection = void 0;
const base_1 = require("../../internal/base");
const price_1 = require("./price");
class PriceCollection extends base_1.Collection {
    fromJson(data) {
        return new price_1.Price(data);
    }
}
exports.PriceCollection = PriceCollection;
