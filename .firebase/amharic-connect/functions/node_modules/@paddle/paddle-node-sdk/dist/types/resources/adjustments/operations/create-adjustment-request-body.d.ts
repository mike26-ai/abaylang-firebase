import { type AdjustmentAction, type AdjustmentType } from '../../../enums';
export interface CreateAdjustmentLineItem {
    amount: string | null;
    itemId: string;
    type: AdjustmentType;
}
export interface CreateAdjustmentRequestBody {
    action: AdjustmentAction;
    items: CreateAdjustmentLineItem[];
    reason: string;
    transactionId: string;
}
