import { type ITotals } from '../index';
export interface ITaxRatesUsedResponse {
    tax_rate: string;
    totals?: ITotals | null;
}
