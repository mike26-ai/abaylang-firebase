import { Event } from '../../../entities/events/event';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { AddressNotification } from '../../entities';
import { type IAddressNotificationResponse } from '../../types';
export declare class AddressUpdatedEvent extends Event {
    readonly eventType = EventName.AddressUpdated;
    readonly data: AddressNotification;
    constructor(response: IEventsResponse<IAddressNotificationResponse>);
}
