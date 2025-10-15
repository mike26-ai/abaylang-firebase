import { type ScheduledChangeAction } from '../../enums';
export interface ISubscriptionScheduledChangeResponse {
    action: ScheduledChangeAction;
    effective_at: string;
    resume_at?: string | null;
}
