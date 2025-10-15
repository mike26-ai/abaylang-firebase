import { Price, PriceCollection } from '../../entities';
import { BaseResource } from '../../internal/base';
import { type CreatePriceRequestBody, type GetPriceQueryParameters, type ListPriceQueryParameters, type UpdatePriceRequestBody } from './operations';
export * from './operations';
export declare class PricesResource extends BaseResource {
    list(queryParams?: ListPriceQueryParameters): PriceCollection;
    create(createPriceParameters: CreatePriceRequestBody): Promise<Price>;
    get(priceId: string, queryParams?: GetPriceQueryParameters): Promise<Price>;
    update(priceId: string, updatePrice: UpdatePriceRequestBody): Promise<Price>;
    archive(priceId: string): Promise<Price>;
}
