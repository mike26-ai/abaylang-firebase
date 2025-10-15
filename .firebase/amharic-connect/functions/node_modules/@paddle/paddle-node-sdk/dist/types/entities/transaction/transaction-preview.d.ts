import { type ITransactionPreviewResponse } from '../../types';
import { AddressPreview, TransactionDetailsPreview, TransactionItemPreview } from '../index';
import { type CurrencyCode, type AvailablePaymentMethod } from '../../enums';
export declare class TransactionPreview {
    readonly customerId: string | null;
    readonly addressId: string | null;
    readonly businessId: string | null;
    readonly currencyCode: CurrencyCode;
    readonly discountId: string | null;
    readonly customerIpAddress: string | null;
    readonly address: AddressPreview | null;
    readonly ignoreTrials: boolean | null;
    readonly items: TransactionItemPreview[];
    readonly details: TransactionDetailsPreview;
    readonly availablePaymentMethods: AvailablePaymentMethod | null;
    constructor(transactionPreview: ITransactionPreviewResponse);
}
