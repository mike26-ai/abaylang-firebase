import { type IBusinessContactsNotification } from '../../types';
export declare class ContactsNotification {
    readonly name: string | null;
    readonly email: string;
    constructor(contacts: IBusinessContactsNotification);
}
