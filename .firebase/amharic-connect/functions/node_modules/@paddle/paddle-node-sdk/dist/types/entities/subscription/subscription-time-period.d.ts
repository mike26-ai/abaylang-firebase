import { type ISubscriptionTimePeriodResponse } from '../../types';
export declare class SubscriptionTimePeriod {
    readonly startsAt: string;
    readonly endsAt: string;
    constructor(subscriptionTimePeriod: ISubscriptionTimePeriodResponse);
}
