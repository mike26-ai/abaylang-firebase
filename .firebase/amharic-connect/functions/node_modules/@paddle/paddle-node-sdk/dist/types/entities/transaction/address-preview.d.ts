import { type CountryCode } from '../../enums';
import { type IAddressPreviewResponse } from '../../resources';
export declare class AddressPreview {
    readonly postalCode: string | null;
    readonly countryCode: CountryCode;
    constructor(address: IAddressPreviewResponse);
}
