import { type CollectionMode, type ScheduledChangeAction, type SubscriptionStatus } from '../../../enums';
export interface ListSubscriptionQueryParameters {
    addressId?: string[];
    after?: string;
    collectionMode?: CollectionMode;
    customerId?: string[];
    id?: string[];
    orderBy?: string;
    perPage?: number;
    priceId?: string[];
    scheduledChangeAction?: ScheduledChangeAction[];
    status?: SubscriptionStatus[];
}
