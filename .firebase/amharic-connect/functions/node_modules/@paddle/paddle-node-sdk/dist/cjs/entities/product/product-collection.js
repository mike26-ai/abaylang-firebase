"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCollection = void 0;
const base_1 = require("../../internal/base");
const product_1 = require("./product");
class ProductCollection extends base_1.Collection {
    fromJson(data) {
        return new product_1.Product(data);
    }
}
exports.ProductCollection = ProductCollection;
