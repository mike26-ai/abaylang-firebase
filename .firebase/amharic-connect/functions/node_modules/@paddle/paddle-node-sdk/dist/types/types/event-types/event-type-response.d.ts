import { type IEventName } from '../../notifications';
export interface IEventTypeResponse {
    name: IEventName;
    description: string;
    group: string;
    available_versions: number[];
}
