import { ImportMetaNotification } from '../index';
import { type Status } from '../../../enums';
import { type ICustomerNotificationResponse } from '../../types';
import { type CustomData } from '../../../entities';
export declare class CustomerNotification {
    readonly id: string;
    readonly name: string | null;
    readonly email: string;
    readonly marketingConsent: boolean;
    readonly status: Status;
    readonly customData: CustomData | null;
    readonly locale: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly importMeta: ImportMetaNotification | null;
    constructor(customer: ICustomerNotificationResponse);
}
