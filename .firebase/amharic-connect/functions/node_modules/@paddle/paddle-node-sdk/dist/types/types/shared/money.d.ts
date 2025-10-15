import { type CurrencyCode } from '../../enums';
export interface IMoney {
    amount: string;
    currencyCode: CurrencyCode;
}
