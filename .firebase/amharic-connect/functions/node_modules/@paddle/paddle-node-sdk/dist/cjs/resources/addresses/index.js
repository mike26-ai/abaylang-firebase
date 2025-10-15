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
exports.AddressesResource = void 0;
const entities_1 = require("../../entities");
const base_1 = require("../../internal/base");
const AddressPaths = {
    list: '/customers/{customer_id}/addresses',
    create: '/customers/{customer_id}/addresses',
    get: '/customers/{customer_id}/addresses/{address_id}',
    update: '/customers/{customer_id}/addresses/{address_id}',
};
__exportStar(require("./operations"), exports);
class AddressesResource extends base_1.BaseResource {
    list(customerId, queryParams) {
        const queryParameters = new base_1.QueryParameters(queryParams);
        const urlWithPathParams = new base_1.PathParameters(AddressPaths.list, {
            customer_id: customerId,
        }).deriveUrl();
        return new entities_1.AddressCollection(this.client, urlWithPathParams + queryParameters.toQueryString());
    }
    create(customerId, createAddressParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlWithPathParams = new base_1.PathParameters(AddressPaths.create, {
                customer_id: customerId,
            }).deriveUrl();
            const response = yield this.client.post(urlWithPathParams, createAddressParameters);
            const data = this.handleResponse(response);
            return new entities_1.Address(data);
        });
    }
    get(customerId, addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlWithPathParams = new base_1.PathParameters(AddressPaths.get, {
                customer_id: customerId,
                address_id: addressId,
            }).deriveUrl();
            const response = yield this.client.get(urlWithPathParams);
            const data = this.handleResponse(response);
            return new entities_1.Address(data);
        });
    }
    update(customerId, addressId, updateAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlWithPathParams = new base_1.PathParameters(AddressPaths.update, {
                customer_id: customerId,
                address_id: addressId,
            }).deriveUrl();
            const response = yield this.client.patch(urlWithPathParams, updateAddress);
            const data = this.handleResponse(response);
            return new entities_1.Address(data);
        });
    }
    archive(customerId, addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.update(customerId, addressId, { status: 'archived' });
        });
    }
}
exports.AddressesResource = AddressesResource;
