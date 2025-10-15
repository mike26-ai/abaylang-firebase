import { Price, Proration } from '../index';
import { type ITransactionItemPreviewResponse } from '../../types';
export declare class TransactionItemPreview {
    readonly price: Price | null;
    readonly quantity: number;
    readonly includeInTotals: boolean | null;
    readonly proration: Proration | null;
    constructor(transactionItem: ITransactionItemPreviewResponse);
}
