"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentCollection = void 0;
const adjustment_1 = require("./adjustment");
const base_1 = require("../../internal/base");
class AdjustmentCollection extends base_1.Collection {
    fromJson(data) {
        return new adjustment_1.Adjustment(data);
    }
}
exports.AdjustmentCollection = AdjustmentCollection;
