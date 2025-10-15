import { Address } from './address';
import { type IAddressResponse } from '../../types';
import { Collection } from '../../internal/base';
export declare class AddressCollection extends Collection<IAddressResponse, Address> {
    fromJson(data: IAddressResponse): Address;
}
