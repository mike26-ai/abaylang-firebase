import { type ITransactionProrationNotificationResponse } from '../../types';
import { TransactionsTimePeriodNotification } from '../index';
export declare class TransactionProrationNotification {
    readonly rate: string;
    readonly billingPeriod: TransactionsTimePeriodNotification | null;
    constructor(transactionProration: ITransactionProrationNotificationResponse);
}
