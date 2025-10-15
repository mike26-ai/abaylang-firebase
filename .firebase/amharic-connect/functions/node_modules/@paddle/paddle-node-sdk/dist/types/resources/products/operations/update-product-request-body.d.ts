import { type ICustomData } from '../../../types';
import { type TaxCategory, type Status, type CatalogType } from '../../../enums';
export interface UpdateProductRequestBody {
    name?: string;
    description?: string | null;
    type?: CatalogType | null;
    taxCategory?: TaxCategory;
    imageUrl?: string | null;
    customData?: ICustomData | null;
    status?: Status;
}
