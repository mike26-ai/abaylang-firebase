import { type IMoneyResponse } from '../../types';
import { type CurrencyCode } from '../../enums';
export declare class Money {
    readonly amount: string;
    readonly currencyCode: CurrencyCode;
    constructor(money: IMoneyResponse);
}
