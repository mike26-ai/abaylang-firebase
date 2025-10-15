import { type IChargebackFee } from '../../types';
import { AdjustmentOriginalAmount } from '../index';
export declare class ChargebackFee {
    readonly amount: string;
    readonly original: AdjustmentOriginalAmount | null;
    constructor(chargebackFee: IChargebackFee);
}
