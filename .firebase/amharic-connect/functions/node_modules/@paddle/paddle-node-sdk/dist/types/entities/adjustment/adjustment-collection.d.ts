import { Adjustment } from './adjustment';
import { type IAdjustmentResponse } from '../../types';
import { Collection } from '../../internal/base';
export declare class AdjustmentCollection extends Collection<IAdjustmentResponse, Adjustment> {
    fromJson(data: IAdjustmentResponse): Adjustment;
}
