import { type IPaymentMethodDetailsNotification } from '../index';
import { type PaymentAttemptStatus, type ErrorCode } from '../../../enums';
export interface ITransactionPaymentAttemptNotificationResponse {
    payment_attempt_id: string;
    stored_payment_method_id: string;
    payment_method_id?: string | null;
    amount: string;
    status: PaymentAttemptStatus;
    error_code?: ErrorCode | null;
    method_details?: IPaymentMethodDetailsNotification | null;
    created_at: string;
    captured_at?: string | null;
}
