import { Event } from '../../../entities/events/event';
import { ProductNotification } from '../../entities';
import { EventName } from '../../helpers';
import { type IEventsResponse } from '../../../types';
import { type IProductNotificationResponse } from '../../types';
export declare class ProductImportedEvent extends Event {
    readonly eventType = EventName.ProductImported;
    readonly data: ProductNotification;
    constructor(response: IEventsResponse<IProductNotificationResponse>);
}
