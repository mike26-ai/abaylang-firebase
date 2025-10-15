import { Report } from '../../entities';
import { type IReportResponse } from '../../types';
import { Collection } from '../../internal/base';
export declare class ReportCollection extends Collection<IReportResponse, Report> {
    fromJson(data: IReportResponse): Report;
}
