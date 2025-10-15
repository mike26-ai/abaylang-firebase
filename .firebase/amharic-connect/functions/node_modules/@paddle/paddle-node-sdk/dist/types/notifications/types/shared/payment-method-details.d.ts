import { type IPaymentCardNotificationResponse } from '../index';
import { type PaymentType } from '../../../enums';
export interface IPaymentMethodDetailsNotification {
    type: PaymentType;
    card?: IPaymentCardNotificationResponse | null;
}
