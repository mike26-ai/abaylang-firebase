import { type ITransactionPaymentAttemptNotificationResponse } from '../../types';
import { PaymentMethodDetailsNotification } from '../index';
import { type PaymentAttemptStatus, type ErrorCode } from '../../../enums';
export declare class TransactionPaymentAttemptNotification {
    readonly paymentAttemptId: string;
    readonly paymentMethodId: string | null;
    readonly storedPaymentMethodId: string;
    readonly amount: string;
    readonly status: PaymentAttemptStatus;
    readonly errorCode: ErrorCode | null;
    readonly methodDetails: PaymentMethodDetailsNotification | null;
    readonly createdAt: string;
    readonly capturedAt: string | null;
    constructor(transactionPaymentAttempt: ITransactionPaymentAttemptNotificationResponse);
}
