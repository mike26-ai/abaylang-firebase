import { type IBillingDetailsResponse } from '../../types';
import { TimePeriod } from '../index';
export declare class BillingDetails {
    readonly enableCheckout: boolean | null;
    readonly purchaseOrderNumber: string | null;
    readonly additionalInformation: string | null;
    readonly paymentTerms: TimePeriod;
    constructor(billingDetails: IBillingDetailsResponse);
}
