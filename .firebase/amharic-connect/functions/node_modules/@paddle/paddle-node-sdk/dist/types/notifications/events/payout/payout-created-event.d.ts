import { Event } from '../../../entities/events/event';
import { PayoutNotification } from '../../entities';
import { type IEventsResponse } from '../../../types';
import { EventName } from '../../helpers';
import { type IPayoutNotificationResponse } from '../../types';
export declare class PayoutCreatedEvent extends Event {
    readonly eventType = EventName.PayoutCreated;
    readonly data: PayoutNotification;
    constructor(response: IEventsResponse<IPayoutNotificationResponse>);
}
