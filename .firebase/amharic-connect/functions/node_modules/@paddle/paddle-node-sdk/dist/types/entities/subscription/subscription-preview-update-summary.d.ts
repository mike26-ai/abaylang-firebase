import { type ISubscriptionPreviewUpdateSummary } from '../../types';
import { Money, SubscriptionPreviewSummaryResult } from '../index';
export declare class SubscriptionPreviewUpdateSummary {
    readonly credit: Money;
    readonly charge: Money;
    readonly result: SubscriptionPreviewSummaryResult;
    constructor(previewUpdateSummary: ISubscriptionPreviewUpdateSummary);
}
