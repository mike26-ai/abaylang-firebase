import { Event } from '../../../entities/events/event';
import { BusinessNotification } from '../../entities';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { type IBusinessNotificationResponse } from '../../types';
export declare class BusinessImportedEvent extends Event {
    readonly eventType = EventName.BusinessImported;
    readonly data: BusinessNotification;
    constructor(response: IEventsResponse<IBusinessNotificationResponse>);
}
