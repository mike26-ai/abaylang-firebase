import { Event } from '../../../entities/events/event';
import { PayoutNotification } from '../../entities';
import { EventName } from '../../helpers';
import { type IEventsResponse } from '../../../types';
import { type IPayoutNotificationResponse } from '../../types';
export declare class PayoutPaidEvent extends Event {
    readonly eventType = EventName.PayoutPaid;
    readonly data: PayoutNotification;
    constructor(response: IEventsResponse<IPayoutNotificationResponse>);
}
