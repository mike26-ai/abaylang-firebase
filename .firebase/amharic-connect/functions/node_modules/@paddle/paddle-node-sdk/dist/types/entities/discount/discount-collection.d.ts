import { Discount } from './discount';
import { type IDiscountResponse } from '../../types';
import { Collection } from '../../internal/base';
export declare class DiscountCollection extends Collection<IDiscountResponse, Discount> {
    fromJson(data: IDiscountResponse): Discount;
}
