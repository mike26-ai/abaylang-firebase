import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { Event } from '../../../entities/events/event';
import { AddressNotification } from '../../entities';
import { type IAddressNotificationResponse } from '../../types';
export declare class AddressCreatedEvent extends Event {
    readonly eventType = EventName.AddressCreated;
    readonly data: AddressNotification;
    constructor(response: IEventsResponse<IAddressNotificationResponse>);
}
