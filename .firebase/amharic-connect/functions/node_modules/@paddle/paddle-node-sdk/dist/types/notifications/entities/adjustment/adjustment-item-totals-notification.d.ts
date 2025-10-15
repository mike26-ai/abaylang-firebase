import { type IAdjustmentItemTotalsNotificationResponse } from '../../types';
export declare class AdjustmentItemTotalsNotification {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    constructor(adjustmentItemTotals: IAdjustmentItemTotalsNotificationResponse);
}
