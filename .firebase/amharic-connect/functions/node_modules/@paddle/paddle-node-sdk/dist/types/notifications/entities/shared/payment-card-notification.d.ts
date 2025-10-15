import { type IPaymentCardNotificationResponse } from '../../types';
import { type PaymentCardType } from '../../../enums';
export declare class PaymentCardNotification {
    readonly type: PaymentCardType;
    readonly last4: string;
    readonly expiryMonth: number;
    readonly expiryYear: number;
    readonly cardholderName: string;
    constructor(paymentCard: IPaymentCardNotificationResponse);
}
