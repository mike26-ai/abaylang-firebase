import { AdjustmentItem, PayoutTotalsAdjustment, TotalAdjustments } from '../index';
import { type AdjustmentAction, type AdjustmentStatus, type CurrencyCode } from '../../enums';
import { type IAdjustmentResponse } from '../../types';
export declare class Adjustment {
    readonly id: string;
    readonly action: AdjustmentAction;
    readonly transactionId: string;
    readonly subscriptionId: string | null;
    readonly customerId: string;
    readonly reason: string;
    readonly creditAppliedToBalance: boolean;
    readonly currencyCode: CurrencyCode;
    readonly status: AdjustmentStatus;
    readonly items: AdjustmentItem[];
    readonly totals: TotalAdjustments;
    readonly payoutTotals: PayoutTotalsAdjustment | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    constructor(adjustment: IAdjustmentResponse);
}
