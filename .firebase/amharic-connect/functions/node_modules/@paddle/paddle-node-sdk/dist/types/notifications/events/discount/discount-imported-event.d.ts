import { Event } from '../../../entities/events/event';
import { DiscountNotification } from '../../entities';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { type IDiscountNotificationResponse } from '../../types';
export declare class DiscountImportedEvent extends Event {
    readonly eventType = EventName.DiscountImported;
    readonly data: DiscountNotification;
    constructor(response: IEventsResponse<IDiscountNotificationResponse>);
}
