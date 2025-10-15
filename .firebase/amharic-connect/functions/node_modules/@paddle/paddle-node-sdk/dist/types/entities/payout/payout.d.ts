import { type IPayoutResponse } from '../../types';
import { type CurrencyCode, type PayoutStatus } from '../../enums';
export declare class Payout {
    readonly id: string;
    readonly status: PayoutStatus;
    readonly amount: string;
    readonly currencyCode: CurrencyCode;
    constructor(payout: IPayoutResponse);
}
