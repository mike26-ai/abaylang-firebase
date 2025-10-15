import { type IAdjustmentItemTotalsNotificationResponse, type IAdjustmentsProrationNotificationResponse } from '../index';
import { type AdjustmentType } from '../../../enums';
export interface IAdjustmentItemNotificationResponse {
    id: string;
    item_id: string;
    type: AdjustmentType;
    amount?: string | null;
    proration?: IAdjustmentsProrationNotificationResponse | null;
    totals?: IAdjustmentItemTotalsNotificationResponse | null;
}
