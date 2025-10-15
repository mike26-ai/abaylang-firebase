import { type IPaymentMethodDetails } from '../../types';
import { PaymentCard } from '../index';
import { type PaymentType } from '../../enums';
export declare class PaymentMethodDetails {
    readonly type: PaymentType;
    readonly card: PaymentCard | null;
    constructor(paymentMethodDetails: IPaymentMethodDetails);
}
