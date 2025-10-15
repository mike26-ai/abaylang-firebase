import { type ITaxRatesUsedResponse, type ITransactionTotalsResponse, type ITransactionLineItemPreviewResponse } from '../index';
export interface ITransactionDetailsPreviewResponse {
    tax_rates_used: ITaxRatesUsedResponse[];
    totals: ITransactionTotalsResponse;
    line_items: ITransactionLineItemPreviewResponse[];
}
