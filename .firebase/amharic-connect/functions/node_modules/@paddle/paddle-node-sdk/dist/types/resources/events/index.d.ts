import { BaseResource } from '../../internal/base';
import { type ListEventsQueryParameters } from './operations';
import { EventCollection } from '../../entities';
export * from './operations';
export declare class EventsResource extends BaseResource {
    list(queryParams?: ListEventsQueryParameters): EventCollection;
}
