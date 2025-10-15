import { type ITransactionPayoutTotalsResponse } from '../../types';
import { type PayoutCurrencyCode } from '../../enums';
export declare class TransactionPayoutTotals {
    readonly subtotal: string;
    readonly discount: string;
    readonly tax: string;
    readonly total: string;
    readonly credit: string;
    readonly creditToBalance: string;
    readonly balance: string;
    readonly grandTotal: string;
    readonly fee: string;
    readonly earnings: string;
    readonly currencyCode: PayoutCurrencyCode;
    constructor(transactionPayoutTotals: ITransactionPayoutTotalsResponse);
}
