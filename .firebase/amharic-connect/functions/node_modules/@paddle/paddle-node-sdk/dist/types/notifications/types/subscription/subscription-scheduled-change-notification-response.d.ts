import { type ScheduledChangeAction } from '../../../enums';
export interface ISubscriptionScheduledChangeNotificationResponse {
    action: ScheduledChangeAction;
    effective_at: string;
    resume_at?: string | null;
}
