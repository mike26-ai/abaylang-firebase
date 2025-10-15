import { type ITransactionResponse } from '../../types';
import { Collection } from '../../internal/base';
import { Transaction } from './transaction';
export declare class TransactionCollection extends Collection<ITransactionResponse, Transaction> {
    fromJson(data: ITransactionResponse): Transaction;
}
