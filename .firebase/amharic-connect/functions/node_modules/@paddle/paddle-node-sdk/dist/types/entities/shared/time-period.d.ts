import { type ITimePeriod } from '../../types';
import { type Interval } from '../../enums';
export declare class TimePeriod {
    readonly interval: Interval;
    readonly frequency: number;
    constructor(timePeriod: ITimePeriod);
}
