import { type ISubscriptionScheduledChangeResponse } from '../../types';
import { type ScheduledChangeAction } from '../../enums';
export declare class SubscriptionScheduledChange {
    readonly action: ScheduledChangeAction;
    readonly effectiveAt: string;
    readonly resumeAt: string | null;
    constructor(subscriptionScheduledChange: ISubscriptionScheduledChangeResponse);
}
