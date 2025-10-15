import { type IReportFiltersNotification } from '../../types';
import { type ReportFilterName, type ReportFilterOperator } from '../../../enums';
export declare class ReportFiltersNotification {
    readonly name: ReportFilterName;
    readonly operator: null | ReportFilterOperator;
    readonly value: string[] | string;
    constructor(reportFiltersResponse: IReportFiltersNotification);
}
