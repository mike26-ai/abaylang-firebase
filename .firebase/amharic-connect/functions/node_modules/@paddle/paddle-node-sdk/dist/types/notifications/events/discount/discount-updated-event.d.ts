import { Event } from '../../../entities/events/event';
import { DiscountNotification } from '../../entities';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { type IDiscountNotificationResponse } from '../../types';
export declare class DiscountUpdatedEvent extends Event {
    readonly eventType = EventName.DiscountUpdated;
    readonly data: DiscountNotification;
    constructor(response: IEventsResponse<IDiscountNotificationResponse>);
}
