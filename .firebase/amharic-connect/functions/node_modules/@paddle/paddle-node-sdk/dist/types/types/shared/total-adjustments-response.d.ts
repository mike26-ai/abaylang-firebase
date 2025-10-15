import { type CurrencyCode } from '../../enums';
export interface ITotalAdjustmentsResponse {
    subtotal: string;
    tax: string;
    total: string;
    fee: string;
    earnings: string;
    currency_code: CurrencyCode;
}
