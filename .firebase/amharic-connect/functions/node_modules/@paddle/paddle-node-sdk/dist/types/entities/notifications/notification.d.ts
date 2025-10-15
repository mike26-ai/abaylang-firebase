import { type NotificationStatus, type Origin } from '../../enums';
import { type EventEntity, type IEventName } from '../../notifications';
import { type INotificationResponse } from '../../types';
export declare class Notification {
    readonly id: string;
    readonly type: IEventName;
    readonly status: NotificationStatus;
    readonly payload: EventEntity | null;
    readonly occurredAt: string;
    readonly deliveredAt: null | string;
    readonly replayedAt: null | string;
    readonly origin: Origin;
    readonly lastAttemptAt: null | string;
    readonly retryAt: null | string;
    readonly timesAttempted: number;
    readonly notificationSettingId: string;
    constructor(notificationResponse: INotificationResponse);
}
