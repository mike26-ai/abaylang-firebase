import { type ITransactionsTimePeriodResponse } from '../../types';
export declare class TransactionsTimePeriod {
    readonly startsAt: string;
    readonly endsAt: string;
    constructor(transactionsTimePeriod: ITransactionsTimePeriodResponse);
}
