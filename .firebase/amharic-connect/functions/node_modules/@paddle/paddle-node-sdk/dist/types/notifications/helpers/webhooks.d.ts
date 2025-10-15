import { type IEvents } from '../../types';
import { type EventEntity } from './types';
export declare class Webhooks {
    unmarshal(requestBody: string, secretKey: string, signature: string): EventEntity | null;
    isSignatureValid(requestBody: string, secretKey: string, signature: string): boolean;
    static fromJson(data: IEvents): EventEntity | null;
}
