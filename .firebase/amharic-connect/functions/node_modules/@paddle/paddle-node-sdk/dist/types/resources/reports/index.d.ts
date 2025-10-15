import { Report, ReportCollection, ReportCsv } from '../../entities';
import { BaseResource } from '../../internal/base';
import { type CreateReportRequestBody, type ListReportQueryParameters } from './operations';
export * from './operations';
export declare class ReportsResource extends BaseResource {
    list(queryParams?: ListReportQueryParameters): ReportCollection;
    create(createReportParameters: CreateReportRequestBody): Promise<Report>;
    get(reportId: string): Promise<Report>;
    getReportCsv(reportId: string): Promise<ReportCsv>;
}
