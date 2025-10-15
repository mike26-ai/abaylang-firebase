import { type AdjustmentAction, type AdjustmentStatus } from '../../../enums';
export interface ListAdjustmentQueryParameters {
    action?: AdjustmentAction;
    after?: string;
    customerId?: string[];
    orderBy?: string;
    perPage?: number;
    status?: AdjustmentStatus[];
    subscriptionId?: string[];
    transactionId?: string[];
    id?: string[];
}
