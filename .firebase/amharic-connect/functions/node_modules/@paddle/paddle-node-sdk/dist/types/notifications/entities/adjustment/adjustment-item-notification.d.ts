import { type IAdjustmentItemNotificationResponse } from '../../types';
import { AdjustmentItemTotalsNotification, AdjustmentProrationNotification } from '../index';
import { type AdjustmentType } from '../../../enums';
export declare class AdjustmentItemNotification {
    readonly id: string;
    readonly itemId: string;
    readonly type: AdjustmentType;
    readonly amount: string | null;
    readonly proration: AdjustmentProrationNotification | null;
    readonly totals: AdjustmentItemTotalsNotification | null;
    constructor(adjustmentItem: IAdjustmentItemNotificationResponse);
}
