import { type IMoneyResponse } from '../shared';
export interface ISubscriptionResultResponse extends IMoneyResponse {
    action: 'credit' | 'charge';
}
