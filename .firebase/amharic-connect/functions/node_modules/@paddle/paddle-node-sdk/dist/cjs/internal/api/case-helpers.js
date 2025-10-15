"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSnakeCase = void 0;
const lodash_1 = require("lodash");
function isTopLevelCustomDataCamel(input) {
    return 'customData' in input;
}
function decamelizeKeys(obj) {
    if (!(0, lodash_1.isObject)(obj) || (0, lodash_1.isDate)(obj) || (0, lodash_1.isRegExp)(obj) || (0, lodash_1.isBoolean)(obj) || (0, lodash_1.isFunction)(obj)) {
        return obj;
    }
    let output;
    let i = 0;
    let l = 0;
    if ((0, lodash_1.isArray)(obj)) {
        output = [];
        for (l = obj.length; i < l; i++) {
            output.push(decamelizeKeys(obj[i]));
        }
    }
    else {
        output = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                output[(0, lodash_1.snakeCase)(key)] = decamelizeKeys(obj[key]);
            }
        }
    }
    return output;
}
function convertToSnakeCase(input) {
    if (!input || !(0, lodash_1.isObject)(input)) {
        return input;
    }
    if (isTopLevelCustomDataCamel(input)) {
        const { customData } = input, rest = __rest(input, ["customData"]);
        const result = decamelizeKeys(rest);
        return Object.assign(Object.assign({}, result), { custom_data: customData });
    }
    else {
        return decamelizeKeys(input);
    }
}
exports.convertToSnakeCase = convertToSnakeCase;
