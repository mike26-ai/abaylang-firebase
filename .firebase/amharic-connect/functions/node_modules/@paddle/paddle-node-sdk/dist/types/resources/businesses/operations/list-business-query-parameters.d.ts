import { type Status } from '../../../enums';
export interface ListBusinessQueryParameters {
    after?: string;
    id?: string[];
    orderBy?: string;
    perPage?: number;
    search?: string;
    status?: Status[];
}
