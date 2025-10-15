import { AdjustmentItemTotals, AdjustmentProration } from '../adjustment';
import { type AdjustmentType } from '../../enums';
import { type IAdjustmentItemResponse } from '../../types';
export declare class NextTransactionAdjustmentItem {
    readonly itemId: string;
    readonly type: AdjustmentType;
    readonly amount: string | null;
    readonly proration: AdjustmentProration | null;
    readonly totals: AdjustmentItemTotals | null;
    constructor(adjustmentItem: IAdjustmentItemResponse);
}
