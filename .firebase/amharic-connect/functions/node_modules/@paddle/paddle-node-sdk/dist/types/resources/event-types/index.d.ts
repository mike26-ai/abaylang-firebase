import { BaseResource } from '../../internal/base';
import { EventType } from '../../entities';
export declare class EventTypesResource extends BaseResource {
    list(): Promise<EventType[]>;
}
