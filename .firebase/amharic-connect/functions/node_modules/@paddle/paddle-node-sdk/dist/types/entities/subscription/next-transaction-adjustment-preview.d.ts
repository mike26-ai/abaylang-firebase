import { NextTransactionAdjustmentItem } from './next-transaction-adjustment-item';
import { TotalAdjustments } from '../shared';
import { type AdjustmentPreviewResponse } from '../../types';
export declare class NextTransactionAdjustmentPreview {
    readonly transactionId: string;
    readonly items: NextTransactionAdjustmentItem[];
    readonly totals: TotalAdjustments | null;
    constructor(adjustmentPreview: AdjustmentPreviewResponse);
}
