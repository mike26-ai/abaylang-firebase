import { type IReportFilters } from '../../../types';
import { type ReportType } from '../../../enums';
export interface CreateReportRequestBody {
    type: ReportType;
    filters?: IReportFilters[] | null;
}
