import { type IAdjustmentOriginalAmountResponse } from '../index';
export interface IChargebackFee {
    amount: string;
    original?: IAdjustmentOriginalAmountResponse | null;
}
