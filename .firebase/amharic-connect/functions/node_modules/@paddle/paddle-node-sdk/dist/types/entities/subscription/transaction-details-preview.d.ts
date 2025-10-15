import { type ITransactionDetailsPreviewResponse } from '../../types';
import { TaxRatesUsed, TransactionTotals, TransactionLineItemPreview } from '../index';
export declare class TransactionDetailsPreview {
    readonly taxRatesUsed: TaxRatesUsed[];
    readonly totals: TransactionTotals;
    readonly lineItems: TransactionLineItemPreview[];
    constructor(transactionDetailsPreview: ITransactionDetailsPreviewResponse);
}
