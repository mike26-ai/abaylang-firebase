import { type ICustomerBalance } from '../index';
import { type CurrencyCode } from '../../enums';
export interface ICreditBalanceResponse {
    customer_id?: string | null;
    currency_code?: CurrencyCode | null;
    balance?: ICustomerBalance | null;
}
