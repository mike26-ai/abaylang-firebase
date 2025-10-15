import { type IReportResponse } from '../../types';
import { ReportFilters } from '../index';
import { type ReportStatus, type ReportType } from '../../enums';
export declare class Report {
    readonly id: string;
    readonly status: ReportStatus;
    readonly rows: number | null;
    readonly type: ReportType;
    readonly filters: ReportFilters[];
    readonly expiresAt: string | null;
    readonly createdAt: string;
    constructor(reportResponse: IReportResponse);
}
