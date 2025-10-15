import { Collection } from '../../internal/base';
import { Notification } from './notification';
import { type INotificationResponse } from '../../types/notifications';
export declare class NotificationCollection extends Collection<INotificationResponse, Notification> {
    fromJson(data: INotificationResponse): Notification;
}
