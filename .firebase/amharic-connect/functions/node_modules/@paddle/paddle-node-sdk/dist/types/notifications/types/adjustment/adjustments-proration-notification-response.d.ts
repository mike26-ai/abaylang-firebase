import { type IAdjustmentsTimePeriodNotificationResponse } from '../index';
export interface IAdjustmentsProrationNotificationResponse {
    rate: string;
    billing_period?: IAdjustmentsTimePeriodNotificationResponse | null;
}
