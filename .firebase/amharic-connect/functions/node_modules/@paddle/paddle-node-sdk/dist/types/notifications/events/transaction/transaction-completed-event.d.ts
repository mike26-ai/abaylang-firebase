import { Event } from '../../../entities/events/event';
import { TransactionNotification } from '../../entities';
import { EventName } from '../../helpers';
import { type IEventsResponse } from '../../../types';
import { type ITransactionNotificationResponse } from '../../types';
export declare class TransactionCompletedEvent extends Event {
    readonly eventType = EventName.TransactionCompleted;
    readonly data: TransactionNotification;
    constructor(response: IEventsResponse<ITransactionNotificationResponse>);
}
