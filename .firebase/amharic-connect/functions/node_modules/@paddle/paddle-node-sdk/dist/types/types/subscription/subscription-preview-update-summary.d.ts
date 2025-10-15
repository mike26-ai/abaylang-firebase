import { type IMoneyResponse, type ISubscriptionResultResponse } from '../index';
export interface ISubscriptionPreviewUpdateSummary {
    credit: IMoneyResponse;
    charge: IMoneyResponse;
    result: ISubscriptionResultResponse;
}
