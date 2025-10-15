import { type IReportFilters } from '../../types';
import { type ReportFilterName, type ReportFilterOperator } from '../../enums';
export declare class ReportFilters {
    readonly name: ReportFilterName;
    readonly operator: null | ReportFilterOperator;
    readonly value: string[] | string;
    constructor(reportFiltersResponse: IReportFilters);
}
