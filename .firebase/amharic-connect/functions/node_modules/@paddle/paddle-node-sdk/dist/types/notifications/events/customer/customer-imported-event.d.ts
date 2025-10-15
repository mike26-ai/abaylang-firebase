import { Event } from '../../../entities/events/event';
import { CustomerNotification } from '../../entities';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { type ICustomerNotificationResponse } from '../../types';
export declare class CustomerImportedEvent extends Event {
    readonly eventType = EventName.CustomerImported;
    readonly data: CustomerNotification;
    constructor(response: IEventsResponse<ICustomerNotificationResponse>);
}
