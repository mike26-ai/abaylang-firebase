import { type SubscriptionEffectiveFrom } from '../../../enums';
export interface PauseSubscription {
    effectiveFrom?: SubscriptionEffectiveFrom | null;
    resumeAt?: null | string;
}
