import { type Client } from '../api/client';
import { type ErrorResponse, type Response } from '../types/response';
export declare class BaseResource {
    protected readonly client: Client;
    constructor(client: Client);
    protected handleError(error: ErrorResponse): void;
    protected handleResponse<T>(response: Response<T> | ErrorResponse): T;
}
