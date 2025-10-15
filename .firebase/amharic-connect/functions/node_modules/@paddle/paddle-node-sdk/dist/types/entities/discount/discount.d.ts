import { type CurrencyCode, type DiscountStatus, type DiscountType } from '../../enums';
import { type IDiscountResponse } from '../../types';
import { type CustomData, ImportMeta } from '../index';
export declare class Discount {
    readonly id: string;
    readonly status: DiscountStatus;
    readonly description: string;
    readonly enabledForCheckout: boolean;
    readonly code: string | null;
    readonly type: DiscountType;
    readonly amount: string;
    readonly currencyCode: CurrencyCode | null;
    readonly recur: boolean;
    readonly maximumRecurringIntervals: number | null;
    readonly usageLimit: number | null;
    readonly restrictTo: string[] | null;
    readonly expiresAt: string | null;
    readonly customData: CustomData | null;
    readonly timesUsed: number | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly importMeta: ImportMeta | null;
    constructor(discount: IDiscountResponse);
}
