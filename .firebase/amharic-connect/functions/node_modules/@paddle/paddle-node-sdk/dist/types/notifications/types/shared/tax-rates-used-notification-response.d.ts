import { type ITotalsNotification } from '../index';
export interface ITaxRatesUsedNotificationResponse {
    tax_rate: string;
    totals?: ITotalsNotification | null;
}
