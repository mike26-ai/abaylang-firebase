import { type DiscountStatus } from '../../../enums';
export interface ListDiscountQueryParameters {
    after?: string;
    code?: string[];
    id?: string[];
    orderBy?: string;
    perPage?: number;
    status?: DiscountStatus[];
}
