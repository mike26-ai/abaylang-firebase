import { type ITimePeriodNotification } from '../../types';
import { type Interval } from '../../../enums';
export declare class TimePeriodNotification {
    readonly interval: Interval;
    readonly frequency: number;
    constructor(timePeriod: ITimePeriodNotification);
}
