import { Address, AddressCollection } from '../../entities';
import { BaseResource } from '../../internal/base';
import { type ListAddressQueryParameters, type CreateAddressRequestBody, type UpdateAddressRequestBody } from './operations';
export * from './operations';
export declare class AddressesResource extends BaseResource {
    list(customerId: string, queryParams?: ListAddressQueryParameters): AddressCollection;
    create(customerId: string, createAddressParameters: CreateAddressRequestBody): Promise<Address>;
    get(customerId: string, addressId: string): Promise<Address>;
    update(customerId: string, addressId: string, updateAddress: UpdateAddressRequestBody): Promise<Address>;
    archive(customerId: string, addressId: string): Promise<Address>;
}
