import { BillingDetailsNotification, TransactionsTimePeriodNotification, TransactionItemNotification, TransactionDetailsNotification, TransactionPaymentAttemptNotification, TransactionCheckoutNotification } from '../index';
import { type TransactionStatus, type CurrencyCode, type TransactionOrigin, type CollectionMode } from '../../../enums';
import { type ITransactionNotificationResponse } from '../../types';
import { type CustomData } from '../../../entities';
export declare class TransactionNotification {
    readonly id: string;
    readonly status: TransactionStatus;
    readonly customerId: string | null;
    readonly addressId: string | null;
    readonly businessId: string | null;
    readonly customData: CustomData | null;
    readonly currencyCode: CurrencyCode;
    readonly origin: TransactionOrigin;
    readonly subscriptionId: string | null;
    readonly invoiceId: string | null;
    readonly invoiceNumber: string | null;
    readonly collectionMode: CollectionMode;
    readonly discountId: string | null;
    readonly billingDetails: BillingDetailsNotification | null;
    readonly billingPeriod: TransactionsTimePeriodNotification | null;
    readonly items: TransactionItemNotification[];
    readonly details: TransactionDetailsNotification | null;
    readonly payments: TransactionPaymentAttemptNotification[];
    readonly checkout: TransactionCheckoutNotification | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly billedAt: string | null;
    constructor(transaction: ITransactionNotificationResponse);
}
