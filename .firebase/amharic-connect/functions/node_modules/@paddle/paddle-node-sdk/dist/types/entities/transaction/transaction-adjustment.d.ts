import { type ITransactionAdjustmentResponse } from '../../types';
import { TransactionAdjustmentItem, TotalAdjustments, PayoutTotalsAdjustment } from '../index';
import { type AdjustmentAction, type CurrencyCode, type AdjustmentStatus } from '../../enums';
export declare class TransactionAdjustment {
    readonly id: string;
    readonly action: AdjustmentAction;
    readonly transactionId: string;
    readonly subscriptionId: string | null;
    readonly customerId: string;
    readonly reason: string;
    readonly creditAppliedToBalance: boolean;
    readonly currencyCode: CurrencyCode;
    readonly status: AdjustmentStatus;
    readonly items: TransactionAdjustmentItem[];
    readonly totals: TotalAdjustments | null;
    readonly payoutTotals: PayoutTotalsAdjustment | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    constructor(adjustment: ITransactionAdjustmentResponse);
}
