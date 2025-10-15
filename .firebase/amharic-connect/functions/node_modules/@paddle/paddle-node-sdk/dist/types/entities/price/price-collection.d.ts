import { type IPriceResponse } from '../../types';
import { Collection } from '../../internal/base';
import { Price } from './price';
export declare class PriceCollection extends Collection<IPriceResponse, Price> {
    fromJson(data: IPriceResponse): Price;
}
