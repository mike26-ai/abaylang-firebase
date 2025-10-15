import { type ITaxRatesUsedResponse } from '../../types';
import { Totals } from '../index';
export declare class TaxRatesUsed {
    readonly taxRate: string;
    readonly totals: Totals | null;
    constructor(taxRatesUsed: ITaxRatesUsedResponse);
}
