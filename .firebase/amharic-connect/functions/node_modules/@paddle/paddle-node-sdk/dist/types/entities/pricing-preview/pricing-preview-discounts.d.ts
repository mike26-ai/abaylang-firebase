import { type IPricingPreviewDiscountsResponse } from '../../types';
import { Discount } from '../index';
export declare class PricingPreviewDiscounts {
    readonly discount: Discount;
    readonly total: string;
    readonly formattedTotal: string;
    constructor(previewDiscount: IPricingPreviewDiscountsResponse);
}
