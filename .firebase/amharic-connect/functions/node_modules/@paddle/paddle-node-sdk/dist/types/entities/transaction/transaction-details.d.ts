import { type ITransactionDetailsResponse } from '../../types';
import { TaxRatesUsed, TransactionTotals, TransactionTotalsAdjusted, TransactionPayoutTotals, TransactionPayoutTotalsAdjusted, TransactionLineItem } from '../index';
export declare class TransactionDetails {
    readonly taxRatesUsed: TaxRatesUsed[];
    readonly totals: TransactionTotals | null;
    readonly adjustedTotals: TransactionTotalsAdjusted | null;
    readonly payoutTotals: TransactionPayoutTotals | null;
    readonly adjustedPayoutTotals: TransactionPayoutTotalsAdjusted | null;
    readonly lineItems: TransactionLineItem[];
    constructor(transactionDetails: ITransactionDetailsResponse);
}
