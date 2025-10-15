import { type IMoneyResponse } from '../index';
import { type CountryCode } from '../../enums';
export interface IUnitPriceOverrideResponse {
    country_codes: CountryCode[];
    unit_price: IMoneyResponse;
}
