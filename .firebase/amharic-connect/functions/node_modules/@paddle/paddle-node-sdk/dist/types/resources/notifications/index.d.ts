import { BaseResource } from '../../internal/base';
import { Notification, NotificationCollection, NotificationLogCollection, ReplayNotification } from '../../entities';
import { type ListNotificationLogQueryParameters, type ListNotificationQueryParameters } from './operations';
export * from './operations';
export declare class NotificationsResource extends BaseResource {
    list(queryParams?: ListNotificationQueryParameters): NotificationCollection;
    get(notificationId: string): Promise<Notification>;
    replay(notificationId: string): Promise<ReplayNotification>;
    getLogs(notificationId: string, queryParams?: ListNotificationLogQueryParameters): NotificationLogCollection;
}
