import { Event } from '../../../entities/events/event';
import { AddressNotification } from '../../entities';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { type IAddressNotificationResponse } from '../../types';
export declare class AddressImportedEvent extends Event {
    readonly eventType = EventName.AddressImported;
    readonly data: AddressNotification;
    constructor(response: IEventsResponse<IAddressNotificationResponse>);
}
