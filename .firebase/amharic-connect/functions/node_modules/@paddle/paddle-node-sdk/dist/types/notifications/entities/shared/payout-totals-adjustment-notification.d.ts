import { type IPayoutTotalsAdjustmentNotificationResponse } from '../../types';
import { ChargebackFeeNotification } from '../index';
import { type PayoutCurrencyCode } from '../../../enums';
export declare class PayoutTotalsAdjustmentNotification {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    readonly fee: string;
    readonly chargebackFee: ChargebackFeeNotification | null;
    readonly earnings: string;
    readonly currencyCode: PayoutCurrencyCode;
    constructor(payoutTotalsAdjustment: IPayoutTotalsAdjustmentNotificationResponse);
}
