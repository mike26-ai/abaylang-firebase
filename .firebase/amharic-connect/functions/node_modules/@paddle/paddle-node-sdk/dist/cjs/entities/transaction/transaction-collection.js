"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionCollection = void 0;
const base_1 = require("../../internal/base");
const transaction_1 = require("./transaction");
class TransactionCollection extends base_1.Collection {
    fromJson(data) {
        return new transaction_1.Transaction(data);
    }
}
exports.TransactionCollection = TransactionCollection;
