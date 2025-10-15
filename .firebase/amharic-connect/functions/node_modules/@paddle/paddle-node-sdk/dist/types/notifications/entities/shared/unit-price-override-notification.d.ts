import { type IUnitPriceOverrideNotificationResponse } from '../../types';
import { MoneyNotification } from '../index';
import { type CountryCode } from '../../../enums';
export declare class UnitPriceOverrideNotification {
    readonly countryCodes: CountryCode[];
    readonly unitPrice: MoneyNotification;
    constructor(unitPriceOverride: IUnitPriceOverrideNotificationResponse);
}
