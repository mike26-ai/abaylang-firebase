import { type ReportFilterName, type ReportFilterOperator } from '../../enums';
export interface IReportFilters {
    name: ReportFilterName;
    operator?: null | ReportFilterOperator;
    value: string[] | string;
}
