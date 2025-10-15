"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENVIRONMENT_TO_BASE_URL_MAP = void 0;
const environment_1 = require("./environment");
exports.API_ENVIRONMENT_TO_BASE_URL_MAP = {
    [environment_1.Environment.production]: 'https://api.paddle.com',
    [environment_1.Environment.sandbox]: 'https://sandbox-api.paddle.com',
};
