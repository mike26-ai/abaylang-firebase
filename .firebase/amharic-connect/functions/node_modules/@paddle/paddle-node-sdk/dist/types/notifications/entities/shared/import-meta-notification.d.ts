import { type IImportMetaNotificationResponse } from '../../types';
export declare class ImportMetaNotification {
    readonly externalId: string | null;
    readonly importedFrom: string;
    constructor(importMeta: IImportMetaNotificationResponse);
}
