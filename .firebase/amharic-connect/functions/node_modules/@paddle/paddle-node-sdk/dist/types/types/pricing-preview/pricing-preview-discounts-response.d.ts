import { type IDiscountResponse } from '../discount';
export interface IPricingPreviewDiscountsResponse {
    discount: IDiscountResponse;
    total: string;
    formatted_total: string;
}
