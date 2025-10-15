import { type ITaxRatesUsedNotificationResponse } from '../../types';
import { TotalsNotification } from '../index';
export declare class TaxRatesUsedNotification {
    readonly taxRate: string;
    readonly totals: TotalsNotification | null;
    constructor(taxRatesUsed: ITaxRatesUsedNotificationResponse);
}
