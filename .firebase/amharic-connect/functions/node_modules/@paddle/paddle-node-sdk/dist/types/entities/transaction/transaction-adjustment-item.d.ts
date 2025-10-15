import { type ITransactionAdjustmentItemResponse } from '../../types';
import { AdjustmentItemTotals, TransactionProration } from '../index';
import { type AdjustmentType } from '../../enums';
export declare class TransactionAdjustmentItem {
    readonly id: string | null;
    readonly itemId: string;
    readonly type: AdjustmentType;
    readonly amount: string | null;
    readonly proration: TransactionProration | null;
    readonly totals: AdjustmentItemTotals | null;
    constructor(transactionAdjustmentItem: ITransactionAdjustmentItemResponse);
}
