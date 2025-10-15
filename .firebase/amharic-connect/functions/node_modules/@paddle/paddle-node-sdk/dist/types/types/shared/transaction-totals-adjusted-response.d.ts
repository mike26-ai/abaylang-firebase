import { type CurrencyCode } from '../../enums';
export interface ITransactionTotalsAdjustedResponse {
    subtotal: string;
    tax: string;
    total: string;
    grand_total: string;
    fee?: string | null;
    earnings?: string | null;
    currency_code: CurrencyCode;
}
