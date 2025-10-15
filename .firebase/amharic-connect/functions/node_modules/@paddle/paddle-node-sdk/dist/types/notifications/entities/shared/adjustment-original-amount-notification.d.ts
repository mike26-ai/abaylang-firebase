import { type IAdjustmentOriginalAmountNotificationResponse } from '../../types';
import { type AdjustmentCurrencyCode } from '../../../enums';
export declare class AdjustmentOriginalAmountNotification {
    readonly amount: string;
    readonly currencyCode: AdjustmentCurrencyCode;
    constructor(originalAmount: IAdjustmentOriginalAmountNotificationResponse);
}
