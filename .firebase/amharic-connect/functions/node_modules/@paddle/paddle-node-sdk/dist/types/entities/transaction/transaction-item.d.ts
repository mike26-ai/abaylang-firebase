import { type ITransactionItemResponse } from '../../types';
import { Price, TransactionProration } from '../index';
export declare class TransactionItem {
    readonly price: Price | null;
    readonly quantity: number;
    readonly proration: TransactionProration | null;
    constructor(transactionItem: ITransactionItemResponse);
}
