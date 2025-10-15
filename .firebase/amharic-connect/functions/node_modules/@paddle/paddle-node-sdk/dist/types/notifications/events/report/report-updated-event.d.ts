import { Event } from '../../../entities/events/event';
import { ReportNotification } from '../../entities';
import { EventName } from '../../helpers';
import { type IEventsResponse } from '../../../types';
import { type IReportNotificationResponse } from '../../types';
export declare class ReportUpdatedEvent extends Event {
    readonly eventType = EventName.ReportUpdated;
    readonly data: ReportNotification;
    constructor(response: IEventsResponse<IReportNotificationResponse>);
}
