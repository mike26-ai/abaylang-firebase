import { type ITransactionProrationResponse } from '../../types';
import { TransactionsTimePeriod } from '../index';
export declare class TransactionProration {
    readonly rate: string;
    readonly billingPeriod: TransactionsTimePeriod | null;
    constructor(transactionProration: ITransactionProrationResponse);
}
