import { type CurrencyCode } from '../../../enums';
export interface IMoneyNotificationResponse {
    amount: string;
    currency_code: CurrencyCode;
}
