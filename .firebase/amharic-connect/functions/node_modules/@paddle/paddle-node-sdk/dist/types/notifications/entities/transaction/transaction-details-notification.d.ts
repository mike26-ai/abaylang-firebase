import { type ITransactionDetailsNotificationResponse } from '../../types';
import { TaxRatesUsedNotification, TransactionTotalsNotification, TransactionTotalsAdjustedNotification, TransactionPayoutTotalsNotification, TransactionPayoutTotalsAdjustedNotification, TransactionLineItemNotification } from '../index';
export declare class TransactionDetailsNotification {
    readonly taxRatesUsed: TaxRatesUsedNotification[];
    readonly totals: TransactionTotalsNotification | null;
    readonly adjustedTotals: TransactionTotalsAdjustedNotification | null;
    readonly payoutTotals: TransactionPayoutTotalsNotification | null;
    readonly adjustedPayoutTotals: TransactionPayoutTotalsAdjustedNotification | null;
    readonly lineItems: TransactionLineItemNotification[];
    constructor(transactionDetails: ITransactionDetailsNotificationResponse);
}
