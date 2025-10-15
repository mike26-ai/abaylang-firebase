import { type IPayoutNotificationResponse } from '../../types';
import { type CurrencyCode, type PayoutStatus } from '../../../enums';
export declare class PayoutNotification {
    readonly id: string;
    readonly status: PayoutStatus;
    readonly amount: string;
    readonly currencyCode: CurrencyCode;
    constructor(payout: IPayoutNotificationResponse);
}
