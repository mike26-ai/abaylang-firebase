import { type ISubscriptionManagementResponse } from '../../types';
export declare class SubscriptionManagement {
    readonly updatePaymentMethod: string | null;
    readonly cancel: string;
    constructor(subscriptionManagement: ISubscriptionManagementResponse);
}
