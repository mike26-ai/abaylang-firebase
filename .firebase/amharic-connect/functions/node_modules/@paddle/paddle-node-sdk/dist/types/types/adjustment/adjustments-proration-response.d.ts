import { type IAdjustmentsTimePeriodResponse } from '../index';
export interface IAdjustmentsProrationResponse {
    rate: string;
    billing_period?: IAdjustmentsTimePeriodResponse | null;
}
