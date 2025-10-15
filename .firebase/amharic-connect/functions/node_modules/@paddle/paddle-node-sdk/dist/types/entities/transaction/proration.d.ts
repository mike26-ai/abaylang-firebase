import { TransactionsTimePeriod } from '../index';
import { type IProrationResponse } from '../../types';
export declare class Proration {
    readonly rate: string;
    readonly billingPeriod: TransactionsTimePeriod;
    constructor(prorationResponse: IProrationResponse);
}
