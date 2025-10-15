import { type IImportMetaResponse } from '../../types';
export declare class ImportMeta {
    readonly externalId: string | null;
    readonly importedFrom: string;
    constructor(importMeta: IImportMetaResponse);
}
