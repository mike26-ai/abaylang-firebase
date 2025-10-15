import { type Status } from '../../../enums';
export interface ListCustomerQueryParameters {
    after?: string;
    id?: string[];
    orderBy?: string;
    perPage?: number;
    search?: string;
    status?: Status[];
    email?: string[];
}
