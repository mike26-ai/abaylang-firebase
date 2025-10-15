import { type IUnitTotalsNotification } from '../../types';
export declare class UnitTotalsNotification {
    readonly subtotal: string;
    readonly discount: string;
    readonly tax: string;
    readonly total: string;
    constructor(unitTotals: IUnitTotalsNotification);
}
