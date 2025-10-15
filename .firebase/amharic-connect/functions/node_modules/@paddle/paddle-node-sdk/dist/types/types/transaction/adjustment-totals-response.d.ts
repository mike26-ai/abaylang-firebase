import { type IAdjustmentTotalsBreakdown } from '../index';
import { type CurrencyCode } from '../../enums';
export interface IAdjustmentTotalsResponse {
    subtotal: string;
    tax: string;
    total: string;
    fee: string;
    earnings: string;
    breakdown?: IAdjustmentTotalsBreakdown | null;
    currency_code: CurrencyCode;
}
