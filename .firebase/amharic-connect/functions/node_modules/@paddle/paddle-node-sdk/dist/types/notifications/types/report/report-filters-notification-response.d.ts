import { type ReportFilterName, type ReportFilterOperator } from '../../../enums';
export interface IReportFiltersNotification {
    name: ReportFilterName;
    operator?: null | ReportFilterOperator;
    value: string[] | string;
}
