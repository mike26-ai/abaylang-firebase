import { type IPaymentCardResponse } from '../index';
import { type PaymentType } from '../../enums';
export interface IPaymentMethodDetails {
    type: PaymentType;
    card?: IPaymentCardResponse | null;
}
