import { type ITransactionPayoutTotalsAdjustedResponse } from '../../types';
import { ChargebackFee } from '../index';
import { type PayoutCurrencyCode } from '../../enums';
export declare class TransactionPayoutTotalsAdjusted {
    readonly subtotal: string;
    readonly tax: string;
    readonly total: string;
    readonly fee: string;
    readonly chargebackFee: ChargebackFee | null;
    readonly earnings: string;
    readonly currencyCode: PayoutCurrencyCode;
    constructor(transactionPayoutTotalsAdjusted: ITransactionPayoutTotalsAdjustedResponse);
}
