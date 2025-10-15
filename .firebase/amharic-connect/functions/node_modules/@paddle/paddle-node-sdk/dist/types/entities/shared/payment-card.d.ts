import { type IPaymentCardResponse } from '../../types';
import { type PaymentCardType } from '../../enums';
export declare class PaymentCard {
    readonly type: PaymentCardType;
    readonly last4: string;
    readonly expiryMonth: number;
    readonly expiryYear: number;
    readonly cardholderName: string;
    constructor(paymentCard: IPaymentCardResponse);
}
