import { PricingPreviewLineItem } from './pricing-preview-line-item';
import { type IPricingPreviewDetailsResponse } from '../../types';
export declare class PricingPreviewDetails {
    readonly lineItems: PricingPreviewLineItem[];
    constructor(details: IPricingPreviewDetailsResponse);
}
