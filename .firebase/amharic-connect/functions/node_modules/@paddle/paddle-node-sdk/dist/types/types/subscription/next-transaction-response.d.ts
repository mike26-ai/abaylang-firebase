import { type IAdjustmentItemResponse, type ISubscriptionTimePeriodResponse, type ITotalAdjustmentsResponse, type ITransactionDetailsPreviewResponse } from '../index';
export interface AdjustmentPreviewResponse {
    transaction_id: string;
    items: IAdjustmentItemResponse[];
    totals?: ITotalAdjustmentsResponse | null;
}
export interface INextTransactionResponse {
    billing_period: ISubscriptionTimePeriodResponse;
    details: ITransactionDetailsPreviewResponse;
    adjustments: AdjustmentPreviewResponse[];
}
