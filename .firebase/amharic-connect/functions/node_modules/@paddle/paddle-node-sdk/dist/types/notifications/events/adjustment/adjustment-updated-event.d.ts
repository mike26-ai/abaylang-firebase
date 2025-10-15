import { Event } from '../../../entities/events/event';
import { AdjustmentNotification } from '../../entities';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { type IAdjustmentNotificationResponse } from '../../types';
export declare class AdjustmentUpdatedEvent extends Event {
    readonly eventType = EventName.AdjustmentUpdated;
    readonly data: AdjustmentNotification;
    constructor(response: IEventsResponse<IAdjustmentNotificationResponse>);
}
