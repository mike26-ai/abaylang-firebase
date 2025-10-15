import { type ITotalsNotification } from '../../types';
export declare class TotalsNotification {
    readonly subtotal: string;
    readonly discount: string;
    readonly tax: string;
    readonly total: string;
    constructor(totals: ITotalsNotification);
}
