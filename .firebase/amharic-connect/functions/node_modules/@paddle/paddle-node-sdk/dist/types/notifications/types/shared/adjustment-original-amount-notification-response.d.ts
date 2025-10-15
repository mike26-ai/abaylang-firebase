import { type AdjustmentCurrencyCode } from '../../../enums';
export interface IAdjustmentOriginalAmountNotificationResponse {
    amount: string;
    currency_code: AdjustmentCurrencyCode;
}
