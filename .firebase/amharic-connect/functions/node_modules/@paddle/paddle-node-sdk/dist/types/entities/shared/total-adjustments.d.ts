import { type ITotalAdjustmentsResponse } from '../../types';
import { type CurrencyCode } from '../../enums';
export declare class TotalAdjustments {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    readonly fee: string;
    readonly earnings: string;
    readonly currencyCode: CurrencyCode;
    constructor(totalAdjustments: ITotalAdjustmentsResponse);
}
