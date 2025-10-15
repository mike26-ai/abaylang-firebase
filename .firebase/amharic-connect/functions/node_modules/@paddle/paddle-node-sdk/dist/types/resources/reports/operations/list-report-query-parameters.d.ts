import { type ReportStatus } from '../../../enums';
export interface ListReportQueryParameters {
    after?: string;
    orderBy?: string;
    perPage?: number;
    status?: ReportStatus[];
}
