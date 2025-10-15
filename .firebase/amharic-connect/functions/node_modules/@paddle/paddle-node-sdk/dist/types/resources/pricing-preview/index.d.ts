import { BaseResource } from '../../internal/base';
import { type PricingPreviewRequestBody } from './operations';
import { PricingPreview } from '../../entities/pricing-preview';
export * from './operations';
export declare class PricingPreviewResource extends BaseResource {
    preview(pricePreviewParameter: PricingPreviewRequestBody): Promise<PricingPreview>;
}
