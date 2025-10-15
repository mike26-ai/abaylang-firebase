import { type ITransactionLineItemResponse } from '../../types';
import { TransactionProration, UnitTotals, Totals, Product } from '../index';
export declare class TransactionLineItem {
    readonly id: string;
    readonly priceId: string;
    readonly quantity: number;
    readonly proration: TransactionProration | null;
    readonly taxRate: string;
    readonly unitTotals: UnitTotals | null;
    readonly totals: Totals | null;
    readonly product: Product | null;
    constructor(transactionLineItem: ITransactionLineItemResponse);
}
