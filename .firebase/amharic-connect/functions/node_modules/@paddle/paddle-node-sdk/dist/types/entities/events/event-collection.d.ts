import { Collection } from '../../internal/base';
import { type IEvents, type IEventsResponse } from '../../types';
import { type EventEntity } from '../../notifications';
export declare class EventCollection extends Collection<IEventsResponse, EventEntity | null> {
    fromJson(data: IEvents): EventEntity | null;
}
