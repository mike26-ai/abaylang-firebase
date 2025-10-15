import { type IAdjustmentTotalsResponse } from '../../types';
import { AdjustmentTotalsBreakdown } from '../index';
import { type CurrencyCode } from '../../enums';
export declare class AdjustmentTotals {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    readonly fee: string;
    readonly earnings: string;
    readonly breakdown: AdjustmentTotalsBreakdown | null;
    readonly currencyCode: CurrencyCode;
    constructor(adjustmentTotals: IAdjustmentTotalsResponse);
}
