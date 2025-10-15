import { Price } from '../price';
import { Totals } from '../shared';
import { Product } from '../product';
import { PricingPreviewDiscounts } from './pricing-preview-discounts';
import { type IPricingPreviewLineItemResponse } from '../../types';
export declare class PricingPreviewLineItem {
    readonly price: Price;
    readonly quantity: number;
    readonly taxRate: string;
    readonly unitTotals: Totals;
    readonly formattedUnitTotals: Totals;
    readonly totals: Totals;
    readonly formattedTotals: Totals;
    readonly product: Product;
    readonly discounts: PricingPreviewDiscounts[];
    constructor(lineItem: IPricingPreviewLineItemResponse);
}
