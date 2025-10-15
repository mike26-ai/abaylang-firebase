"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingPreviewResource = void 0;
const base_1 = require("../../internal/base");
const pricing_preview_1 = require("../../entities/pricing-preview");
const PricingPreviewPaths = {
    preview: '/pricing-preview',
};
__exportStar(require("./operations"), exports);
class PricingPreviewResource extends base_1.BaseResource {
    preview(pricePreviewParameter) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.post(PricingPreviewPaths.preview, pricePreviewParameter);
            const data = this.handleResponse(response);
            return new pricing_preview_1.PricingPreview(data);
        });
    }
}
exports.PricingPreviewResource = PricingPreviewResource;
