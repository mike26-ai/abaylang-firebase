import { type CatalogType, type Status } from '../../../enums';
export interface ListPriceQueryParameters {
    after?: string;
    id?: string[];
    type?: CatalogType[];
    include?: string[];
    orderBy?: string;
    perPage?: number;
    productId?: string[];
    status?: Status[];
    recurring?: boolean;
}
