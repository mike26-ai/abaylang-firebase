import { type IAdjustmentsProrationNotificationResponse } from '../../types';
import { AdjustmentTimePeriodNotification } from '../index';
export declare class AdjustmentProrationNotification {
    readonly rate: string;
    readonly billingPeriod: AdjustmentTimePeriodNotification | null;
    constructor(adjustmentsProration: IAdjustmentsProrationNotificationResponse);
}
