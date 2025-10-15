import { type Status } from '../../../enums';
export interface ListAddressQueryParameters {
    after?: string;
    id?: string[];
    orderBy?: string;
    perPage?: number;
    search?: string;
    status?: Status[];
}
