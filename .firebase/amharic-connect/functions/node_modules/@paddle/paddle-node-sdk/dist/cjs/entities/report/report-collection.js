"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportCollection = void 0;
const entities_1 = require("../../entities");
const base_1 = require("../../internal/base");
class ReportCollection extends base_1.Collection {
    fromJson(data) {
        return new entities_1.Report(data);
    }
}
exports.ReportCollection = ReportCollection;
