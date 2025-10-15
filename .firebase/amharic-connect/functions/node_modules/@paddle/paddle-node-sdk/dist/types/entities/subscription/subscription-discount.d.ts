import { type ISubscriptionDiscountResponse } from '../../types';
export declare class SubscriptionDiscount {
    readonly id: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    constructor(subscriptionDiscount: ISubscriptionDiscountResponse);
}
