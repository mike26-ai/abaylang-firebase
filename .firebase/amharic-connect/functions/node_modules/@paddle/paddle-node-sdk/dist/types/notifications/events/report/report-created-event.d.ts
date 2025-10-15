import { Event } from '../../../entities/events/event';
import { ReportNotification } from '../../entities';
import { EventName } from '../../helpers';
import { type IEventsResponse } from '../../../types';
import { type IReportNotificationResponse } from '../../types';
export declare class ReportCreatedEvent extends Event {
    readonly eventType = EventName.ReportCreated;
    readonly data: ReportNotification;
    constructor(response: IEventsResponse<IReportNotificationResponse>);
}
