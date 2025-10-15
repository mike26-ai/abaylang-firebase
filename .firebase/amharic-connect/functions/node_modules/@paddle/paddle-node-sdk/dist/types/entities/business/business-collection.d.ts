import { Business } from './business';
import { type IBusinessResponse } from '../../types';
import { Collection } from '../../internal/base';
export declare class BusinessCollection extends Collection<IBusinessResponse, Business> {
    fromJson(data: IBusinessResponse): Business;
}
