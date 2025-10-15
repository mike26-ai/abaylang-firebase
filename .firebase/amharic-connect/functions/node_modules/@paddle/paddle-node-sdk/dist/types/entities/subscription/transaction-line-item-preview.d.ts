import { type ITransactionLineItemPreviewResponse } from '../../types';
import { UnitTotals, Totals, Product } from '../index';
export declare class TransactionLineItemPreview {
    readonly priceId: string;
    readonly quantity: number;
    readonly taxRate: string;
    readonly unitTotals: UnitTotals;
    readonly totals: Totals;
    readonly product: Product;
    constructor(transactionLineItemPreview: ITransactionLineItemPreviewResponse);
}
