import { type IAdjustmentsTimePeriodNotificationResponse } from '../../types';
export declare class AdjustmentTimePeriodNotification {
    readonly startsAt: string;
    readonly endsAt: string;
    constructor(adjustmentsTimePeriod: IAdjustmentsTimePeriodNotificationResponse);
}
