import { type ICustomData } from '../../../types';
export interface CreateCustomerRequestBody {
    email: string;
    name?: string | null;
    customData?: ICustomData | null;
    locale?: string;
}
