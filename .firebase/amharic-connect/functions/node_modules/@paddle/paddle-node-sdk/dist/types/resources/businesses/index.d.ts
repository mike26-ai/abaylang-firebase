import { Business, BusinessCollection } from '../../entities';
import { BaseResource } from '../../internal/base';
import { type CreateBusinessRequestBody, type ListBusinessQueryParameters, type UpdateBusinessRequestBody } from './operations';
export * from './operations';
export declare class BusinessesResource extends BaseResource {
    list(customerId: string, queryParams?: ListBusinessQueryParameters): BusinessCollection;
    create(customerId: string, createBusinessParameters: CreateBusinessRequestBody): Promise<Business>;
    get(customerId: string, businessId: string): Promise<Business>;
    update(customerId: string, businessId: string, updateBusiness: UpdateBusinessRequestBody): Promise<Business>;
    archive(customerId: string, addressId: string): Promise<Business>;
}
