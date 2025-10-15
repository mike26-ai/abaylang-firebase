import { type INextTransactionResponse } from '../../types';
import { SubscriptionTimePeriod, TransactionDetailsPreview, NextTransactionAdjustmentPreview } from '../index';
export declare class NextTransaction {
    readonly billingPeriod: SubscriptionTimePeriod;
    readonly details: TransactionDetailsPreview;
    readonly adjustments: NextTransactionAdjustmentPreview[];
    constructor(nextTransaction: INextTransactionResponse);
}
