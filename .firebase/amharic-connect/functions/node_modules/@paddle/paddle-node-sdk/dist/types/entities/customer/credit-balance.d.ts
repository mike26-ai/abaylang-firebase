import { type ICreditBalanceResponse } from '../../types';
import { CustomerBalance } from '../index';
import { type CurrencyCode } from '../../enums';
export declare class CreditBalance {
    readonly customerId: string | null;
    readonly currencyCode: CurrencyCode | null;
    readonly balance: CustomerBalance | null;
    constructor(creditBalance: ICreditBalanceResponse);
}
