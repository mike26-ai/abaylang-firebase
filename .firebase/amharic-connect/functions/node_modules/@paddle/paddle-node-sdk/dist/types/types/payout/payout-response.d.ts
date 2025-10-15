import { type CurrencyCode, type PayoutStatus } from '../../enums';
export interface IPayoutResponse {
    id: string;
    status: PayoutStatus;
    amount: string;
    currency_code: CurrencyCode;
}
