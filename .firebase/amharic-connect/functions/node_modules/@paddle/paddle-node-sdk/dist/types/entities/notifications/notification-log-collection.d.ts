import { Collection } from '../../internal/base';
import { type INotificationLogResponse } from '../../types';
import { NotificationLog } from './notification-log';
export declare class NotificationLogCollection extends Collection<INotificationLogResponse, NotificationLog> {
    fromJson(data: INotificationLogResponse): NotificationLog;
}
