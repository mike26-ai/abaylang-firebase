import { type ITransactionItemNotificationResponse } from '../../types';
import { PriceNotification, TransactionProrationNotification } from '../index';
export declare class TransactionItemNotification {
    readonly price: PriceNotification | null;
    readonly quantity: number;
    readonly proration: TransactionProrationNotification | null;
    constructor(transactionItem: ITransactionItemNotificationResponse);
}
