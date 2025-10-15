import { Subscription } from './subscription';
import { type ISubscriptionResponse } from '../../types';
import { Collection } from '../../internal/base';
export declare class SubscriptionCollection extends Collection<ISubscriptionResponse, Subscription> {
    fromJson(data: ISubscriptionResponse): Subscription;
}
