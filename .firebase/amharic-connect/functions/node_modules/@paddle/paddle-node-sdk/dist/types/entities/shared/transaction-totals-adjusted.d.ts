import { type ITransactionTotalsAdjustedResponse } from '../../types';
import { type CurrencyCode } from '../../enums';
export declare class TransactionTotalsAdjusted {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    readonly grandTotal: string;
    readonly fee: string | null;
    readonly earnings: string | null;
    readonly currencyCode: CurrencyCode;
    constructor(transactionTotalsAdjusted: ITransactionTotalsAdjustedResponse);
}
