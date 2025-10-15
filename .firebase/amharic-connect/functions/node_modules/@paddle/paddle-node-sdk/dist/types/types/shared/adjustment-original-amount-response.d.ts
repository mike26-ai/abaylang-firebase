import { type AdjustmentCurrencyCode } from '../../enums';
export interface IAdjustmentOriginalAmountResponse {
    amount: string;
    currency_code: AdjustmentCurrencyCode;
}
