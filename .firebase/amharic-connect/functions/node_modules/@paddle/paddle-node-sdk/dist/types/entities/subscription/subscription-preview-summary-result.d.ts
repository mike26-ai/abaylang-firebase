import { type ISubscriptionResultResponse } from '../../types';
import { type CurrencyCode } from '../../enums';
export declare class SubscriptionPreviewSummaryResult {
    readonly action: 'credit' | 'charge';
    readonly amount: string;
    readonly currencyCode: CurrencyCode;
    constructor(resultResponse: ISubscriptionResultResponse);
}
