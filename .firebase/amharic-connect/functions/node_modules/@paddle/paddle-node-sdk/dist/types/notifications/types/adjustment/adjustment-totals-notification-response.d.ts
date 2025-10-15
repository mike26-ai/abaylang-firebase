import { type IAdjustmentTotalsBreakdownNotification } from '../index';
import { type CurrencyCode } from '../../../enums';
export interface IAdjustmentItemTotalsNotificationResponse {
    subtotal: string;
    tax: string;
    total: string;
    fee: string;
    earnings: string;
    breakdown?: IAdjustmentTotalsBreakdownNotification | null;
    currency_code: CurrencyCode;
}
