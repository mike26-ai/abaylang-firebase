import { ReportFiltersNotification } from '../index';
import { type ReportStatus, type ReportType } from '../../../enums';
import { type IReportNotificationResponse } from '../../types';
export declare class ReportNotification {
    readonly id: string;
    readonly status: ReportStatus;
    readonly rows: number | null;
    readonly type: ReportType;
    readonly filters: ReportFiltersNotification[];
    readonly expiresAt: string | null;
    readonly createdAt: string;
    constructor(reportResponse: IReportNotificationResponse);
}
