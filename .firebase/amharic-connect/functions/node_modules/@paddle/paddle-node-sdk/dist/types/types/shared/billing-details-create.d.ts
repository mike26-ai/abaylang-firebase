import { type ITimePeriod } from '../index';
export interface IBillingDetailsCreate {
    enableCheckout?: boolean;
    purchaseOrderNumber?: string;
    additionalInformation?: string | null;
    paymentTerms: ITimePeriod;
}
