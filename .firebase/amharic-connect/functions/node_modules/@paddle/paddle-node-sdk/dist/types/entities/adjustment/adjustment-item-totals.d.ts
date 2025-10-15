import { type IAdjustmentItemTotals } from '../../types';
export declare class AdjustmentItemTotals {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    constructor(adjustmentItemTotals: IAdjustmentItemTotals);
}
