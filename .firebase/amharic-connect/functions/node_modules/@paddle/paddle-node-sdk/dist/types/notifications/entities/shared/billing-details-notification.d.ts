import { type IBillingDetailsNotificationResponse } from '../../types';
import { TimePeriodNotification } from '../index';
export declare class BillingDetailsNotification {
    readonly enableCheckout: boolean | null;
    readonly purchaseOrderNumber: string | null;
    readonly additionalInformation: string | null;
    readonly paymentTerms: TimePeriodNotification;
    constructor(billingDetails: IBillingDetailsNotificationResponse);
}
