import { Discount, DiscountCollection } from '../../entities';
import { BaseResource } from '../../internal/base';
import { type CreateDiscountRequestBody, type ListDiscountQueryParameters, type UpdateDiscountRequestBody } from './operations';
export * from './operations';
export declare class DiscountsResource extends BaseResource {
    list(queryParams?: ListDiscountQueryParameters): DiscountCollection;
    create(createDiscountParameters: CreateDiscountRequestBody): Promise<Discount>;
    get(discountId: string): Promise<Discount>;
    update(discountId: string, updateDiscount: UpdateDiscountRequestBody): Promise<Discount>;
    archive(discountId: string): Promise<Discount>;
}
