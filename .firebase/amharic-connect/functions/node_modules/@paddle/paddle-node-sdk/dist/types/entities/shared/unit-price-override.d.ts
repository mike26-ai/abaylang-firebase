import { type IUnitPriceOverrideResponse } from '../../types';
import { Money } from '../index';
import { type CountryCode } from '../../enums';
export declare class UnitPriceOverride {
    readonly countryCodes: CountryCode[];
    readonly unitPrice: Money;
    constructor(unitPriceOverride: IUnitPriceOverrideResponse);
}
