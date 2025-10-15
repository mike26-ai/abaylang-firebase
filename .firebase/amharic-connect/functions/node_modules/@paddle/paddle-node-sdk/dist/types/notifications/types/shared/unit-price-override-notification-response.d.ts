import { type IMoneyNotificationResponse } from '../index';
import { type CountryCode } from '../../../enums';
export interface IUnitPriceOverrideNotificationResponse {
    country_codes: CountryCode[];
    unit_price: IMoneyNotificationResponse;
}
