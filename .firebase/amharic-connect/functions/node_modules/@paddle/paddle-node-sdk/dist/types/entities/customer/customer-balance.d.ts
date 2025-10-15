import { type ICustomerBalance } from '../../types';
export declare class CustomerBalance {
    readonly available: string;
    readonly reserved: string;
    readonly used: string;
    constructor(customerBalance: ICustomerBalance);
}
