import { type IChargebackFeeNotification } from '../../types';
import { AdjustmentOriginalAmountNotification } from '../index';
export declare class ChargebackFeeNotification {
    readonly amount: string;
    readonly original: AdjustmentOriginalAmountNotification | null;
    constructor(chargebackFee: IChargebackFeeNotification);
}
