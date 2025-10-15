import { type ITransactionLineItemNotificationResponse } from '../../types';
import { TransactionProrationNotification, UnitTotalsNotification, TotalsNotification, ProductNotification } from '../index';
export declare class TransactionLineItemNotification {
    readonly id: string;
    readonly priceId: string;
    readonly quantity: number;
    readonly proration: TransactionProrationNotification | null;
    readonly taxRate: string;
    readonly unitTotals: UnitTotalsNotification | null;
    readonly totals: TotalsNotification | null;
    readonly product: ProductNotification | null;
    constructor(transactionLineItem: ITransactionLineItemNotificationResponse);
}
