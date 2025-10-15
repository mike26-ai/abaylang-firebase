import { type ISubscriptionScheduledChangeNotificationResponse } from '../../types';
import { type ScheduledChangeAction } from '../../../enums';
export declare class SubscriptionScheduledChangeNotification {
    readonly action: ScheduledChangeAction;
    readonly effectiveAt: string;
    readonly resumeAt: string | null;
    constructor(subscriptionScheduledChange: ISubscriptionScheduledChangeNotificationResponse);
}
