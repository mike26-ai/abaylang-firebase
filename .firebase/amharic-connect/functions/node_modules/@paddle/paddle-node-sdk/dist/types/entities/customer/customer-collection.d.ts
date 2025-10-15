import { Customer } from './customer';
import { type ICustomerResponse } from '../../types';
import { Collection } from '../../internal/base';
export declare class CustomerCollection extends Collection<ICustomerResponse, Customer> {
    fromJson(data: ICustomerResponse): Customer;
}
