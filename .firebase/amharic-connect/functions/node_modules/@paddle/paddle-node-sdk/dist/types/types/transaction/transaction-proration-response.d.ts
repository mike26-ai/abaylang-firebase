import { type ITransactionsTimePeriodResponse } from '../index';
export interface ITransactionProrationResponse {
    rate: string;
    billing_period?: ITransactionsTimePeriodResponse | null;
}
