import { type IPaymentMethodDetailsNotification } from '../../types';
import { type PaymentType } from '../../../enums';
import { PaymentCardNotification } from './payment-card-notification';
export declare class PaymentMethodDetailsNotification {
    readonly type: PaymentType;
    readonly card: PaymentCardNotification | null;
    constructor(paymentMethodDetails: IPaymentMethodDetailsNotification);
}
