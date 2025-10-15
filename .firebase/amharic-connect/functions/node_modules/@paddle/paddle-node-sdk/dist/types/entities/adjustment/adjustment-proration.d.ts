import { type IAdjustmentsProrationResponse } from '../../types';
import { AdjustmentTimePeriod } from '../index';
export declare class AdjustmentProration {
    readonly rate: string;
    readonly billingPeriod: AdjustmentTimePeriod | null;
    constructor(adjustmentsProration: IAdjustmentsProrationResponse);
}
