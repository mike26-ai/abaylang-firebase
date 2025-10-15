import { AdjustmentItemNotification, PayoutTotalsAdjustmentNotification, TotalAdjustmentsNotification } from '../index';
import { type AdjustmentAction, type AdjustmentStatus, type CurrencyCode } from '../../../enums';
import { type IAdjustmentNotificationResponse } from '../../types';
export declare class AdjustmentNotification {
    readonly id: string;
    readonly action: AdjustmentAction;
    readonly transactionId: string;
    readonly subscriptionId: string | null;
    readonly customerId: string;
    readonly reason: string;
    readonly creditAppliedToBalance: boolean;
    readonly currencyCode: CurrencyCode;
    readonly status: AdjustmentStatus;
    readonly items: AdjustmentItemNotification[];
    readonly totals: TotalAdjustmentsNotification;
    readonly payoutTotals: PayoutTotalsAdjustmentNotification | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    constructor(adjustment: IAdjustmentNotificationResponse);
}
