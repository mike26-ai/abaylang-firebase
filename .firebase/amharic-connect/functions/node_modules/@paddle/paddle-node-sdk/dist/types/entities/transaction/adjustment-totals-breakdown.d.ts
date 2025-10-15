import { type IAdjustmentTotalsBreakdown } from '../../types';
export declare class AdjustmentTotalsBreakdown {
    readonly credit: string;
    readonly refund: string;
    readonly chargeback: string;
    constructor(adjustmentTotalsBreakdown: IAdjustmentTotalsBreakdown);
}
