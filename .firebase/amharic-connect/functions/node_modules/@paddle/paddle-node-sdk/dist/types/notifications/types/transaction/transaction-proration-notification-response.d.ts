import { type ITransactionsTimePeriodNotificationResponse } from '../index';
export interface ITransactionProrationNotificationResponse {
    rate: string;
    billing_period?: ITransactionsTimePeriodNotificationResponse | null;
}
