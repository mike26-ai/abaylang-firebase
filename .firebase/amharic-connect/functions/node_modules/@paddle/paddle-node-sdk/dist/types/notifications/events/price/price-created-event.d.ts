import { Event } from '../../../entities/events/event';
import { PriceNotification } from '../../entities';
import { EventName } from '../../helpers';
import { type IEventsResponse } from '../../../types';
import { type IPriceNotificationResponse } from '../../types';
export declare class PriceCreatedEvent extends Event {
    readonly eventType = EventName.PriceCreated;
    readonly data: PriceNotification;
    constructor(response: IEventsResponse<IPriceNotificationResponse>);
}
