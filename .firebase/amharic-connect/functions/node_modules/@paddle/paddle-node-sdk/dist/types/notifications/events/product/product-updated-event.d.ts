import { Event } from '../../../entities/events/event';
import { ProductNotification } from '../../entities';
import { EventName } from '../../helpers';
import { type IEventsResponse } from '../../../types';
import { type IProductNotificationResponse } from '../../types';
export declare class ProductUpdatedEvent extends Event {
    readonly eventType = EventName.ProductUpdated;
    readonly data: ProductNotification;
    constructor(response: IEventsResponse<IProductNotificationResponse>);
}
