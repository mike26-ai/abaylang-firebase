import { type ITimePeriod } from '../index';
export interface IBillingDetailsUpdate {
    enableCheckout: boolean;
    purchaseOrderNumber: string;
    additionalInformation: string;
    paymentTerms: ITimePeriod;
}
