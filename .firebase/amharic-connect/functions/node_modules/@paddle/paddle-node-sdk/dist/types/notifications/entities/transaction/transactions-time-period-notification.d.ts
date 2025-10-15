import { type ITransactionsTimePeriodNotificationResponse } from '../../types';
export declare class TransactionsTimePeriodNotification {
    readonly startsAt: string;
    readonly endsAt: string;
    constructor(transactionsTimePeriod: ITransactionsTimePeriodNotificationResponse);
}
