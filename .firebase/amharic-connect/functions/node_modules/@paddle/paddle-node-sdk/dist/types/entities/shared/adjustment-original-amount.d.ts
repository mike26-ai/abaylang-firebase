import { type IAdjustmentOriginalAmountResponse } from '../../types';
import { type AdjustmentCurrencyCode } from '../../enums';
export declare class AdjustmentOriginalAmount {
    readonly amount: string;
    readonly currencyCode: AdjustmentCurrencyCode;
    constructor(originalAmount: IAdjustmentOriginalAmountResponse);
}
