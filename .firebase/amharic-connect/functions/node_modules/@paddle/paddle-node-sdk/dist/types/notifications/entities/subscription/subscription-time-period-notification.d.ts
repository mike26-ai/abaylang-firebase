import { type ISubscriptionTimePeriodNotificationResponse } from '../../types';
export declare class SubscriptionTimePeriodNotification {
    readonly startsAt: string;
    readonly endsAt: string;
    constructor(subscriptionTimePeriod: ISubscriptionTimePeriodNotificationResponse);
}
