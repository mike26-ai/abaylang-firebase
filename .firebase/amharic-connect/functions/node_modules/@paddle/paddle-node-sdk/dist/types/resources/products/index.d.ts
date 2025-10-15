import { Product, ProductCollection } from '../../entities';
import { BaseResource } from '../../internal/base';
import { type CreateProductRequestBody, type GetProductQueryParameters, type ListProductQueryParameters, type UpdateProductRequestBody } from './operations';
export * from './operations';
export declare class ProductsResource extends BaseResource {
    list(queryParams?: ListProductQueryParameters): ProductCollection;
    create(createProductParameters: CreateProductRequestBody): Promise<Product>;
    get(productId: string, queryParams?: GetProductQueryParameters): Promise<Product>;
    update(productId: string, updateProduct: UpdateProductRequestBody): Promise<Product>;
    archive(productId: string): Promise<Product>;
}
