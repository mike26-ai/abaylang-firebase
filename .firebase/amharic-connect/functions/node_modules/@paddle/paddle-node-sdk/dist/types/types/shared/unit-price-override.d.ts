import { type IMoney } from '../index';
import { type CountryCode } from '../../enums';
export interface IUnitPriceOverride {
    countryCodes: CountryCode[];
    unitPrice: IMoney;
}
