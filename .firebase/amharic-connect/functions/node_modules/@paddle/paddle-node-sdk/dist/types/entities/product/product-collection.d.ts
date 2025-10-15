import { type IProductResponse } from '../../types';
import { Collection } from '../../internal/base';
import { Product } from './product';
export declare class ProductCollection extends Collection<IProductResponse, Product> {
    fromJson(data: IProductResponse): Product;
}
