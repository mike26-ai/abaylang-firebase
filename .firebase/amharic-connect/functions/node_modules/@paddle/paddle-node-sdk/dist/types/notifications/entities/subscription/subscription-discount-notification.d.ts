import { type ISubscriptionDiscountNotificationResponse } from '../../types';
export declare class SubscriptionDiscountNotification {
    readonly id: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    constructor(subscriptionDiscount: ISubscriptionDiscountNotificationResponse);
}
