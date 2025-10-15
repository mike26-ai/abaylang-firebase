import { type IPriceQuantityNotification } from '../../types';
export declare class PriceQuantityNotification {
    readonly minimum: number;
    readonly maximum: number;
    constructor(priceQuantity: IPriceQuantityNotification);
}
