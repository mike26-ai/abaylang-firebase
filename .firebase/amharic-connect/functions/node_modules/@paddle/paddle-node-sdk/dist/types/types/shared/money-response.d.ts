import { type CurrencyCode } from '../../enums';
export interface IMoneyResponse {
    amount: string;
    currency_code: CurrencyCode;
}
