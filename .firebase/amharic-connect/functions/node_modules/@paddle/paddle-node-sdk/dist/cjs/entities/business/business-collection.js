"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessCollection = void 0;
const business_1 = require("./business");
const base_1 = require("../../internal/base");
class BusinessCollection extends base_1.Collection {
    fromJson(data) {
        return new business_1.Business(data);
    }
}
exports.BusinessCollection = BusinessCollection;
