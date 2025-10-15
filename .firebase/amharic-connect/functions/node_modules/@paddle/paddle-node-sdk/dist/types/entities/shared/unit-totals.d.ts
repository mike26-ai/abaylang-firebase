import { type IUnitTotals } from '../../types';
export declare class UnitTotals {
    readonly subtotal: string;
    readonly discount: string;
    readonly tax: string;
    readonly total: string;
    constructor(unitTotals: IUnitTotals);
}
