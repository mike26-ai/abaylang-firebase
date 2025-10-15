import { type IAdjustmentItemResponse } from '../../types';
import { AdjustmentItemTotals, AdjustmentProration } from '../index';
import { type AdjustmentType } from '../../enums';
export declare class AdjustmentItem {
    readonly id: string;
    readonly itemId: string;
    readonly type: AdjustmentType;
    readonly amount: string | null;
    readonly proration: AdjustmentProration | null;
    readonly totals: AdjustmentItemTotals | null;
    constructor(adjustmentItem: IAdjustmentItemResponse);
}
