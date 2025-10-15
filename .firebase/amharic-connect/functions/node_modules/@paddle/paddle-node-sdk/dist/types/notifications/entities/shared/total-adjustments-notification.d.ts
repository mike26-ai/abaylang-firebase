import { type ITotalAdjustmentsNotificationResponse } from '../../types';
import { type CurrencyCode } from '../../../enums';
export declare class TotalAdjustmentsNotification {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    readonly fee: string;
    readonly earnings: string;
    readonly currencyCode: CurrencyCode;
    constructor(totalAdjustments: ITotalAdjustmentsNotificationResponse);
}
