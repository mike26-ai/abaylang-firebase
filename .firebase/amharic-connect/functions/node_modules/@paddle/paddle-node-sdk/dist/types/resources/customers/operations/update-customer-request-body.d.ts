import { type ICustomData } from '../../../types';
import { type Status } from '../../../enums';
export interface UpdateCustomerRequestBody {
    name?: string | null;
    email?: string;
    status?: Status;
    customData?: ICustomData | null;
    locale?: string;
}
