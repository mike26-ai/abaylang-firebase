import { type IEventTypeResponse } from '../../types';
import { type IEventName } from '../../notifications';
export declare class EventType {
    readonly name: IEventName;
    readonly description: string;
    readonly group: string;
    readonly availableVersions: number[];
    constructor(eventType: IEventTypeResponse);
}
