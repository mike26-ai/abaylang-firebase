import { type IAdjustmentOriginalAmountNotificationResponse } from '../index';
export interface IChargebackFeeNotification {
    amount: string;
    original?: IAdjustmentOriginalAmountNotificationResponse | null;
}
