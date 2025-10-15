import { type IMoneyNotificationResponse } from '../../types';
import { type CurrencyCode } from '../../../enums';
export declare class MoneyNotification {
    readonly amount: string;
    readonly currencyCode: CurrencyCode;
    constructor(money: IMoneyNotificationResponse);
}
