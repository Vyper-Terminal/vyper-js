export class VyperApiError extends Error {
    statusCode?: number;
    response?: any;

    constructor(message: string, statusCode?: number, response?: any) {
        super(message);
        this.name = 'VyperApiException';
        this.statusCode = statusCode;
        this.response = response;
    }
}

export class VyperWebsocketError extends Error {
    statusCode?: number;
    connectionInfo?: any;

    constructor(message: string, statusCode?: number, connectionInfo?: any) {
        super(message);
        this.name = 'VyperWebsocketException';
        this.statusCode = statusCode;
        this.connectionInfo = connectionInfo;
    }
}

export class AuthenticationError extends VyperApiError {
    constructor(message: string, statusCode?: number, response?: any) {
        super(message, statusCode, response);
        this.name = 'AuthenticationError';
    }
}

export class RateLimitError extends VyperApiError {
    retryAfter: number;

    constructor(message: string, retryAfter: number) {
        super(message);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

export class ServerError extends VyperApiError {
    constructor(message: string, statusCode?: number, response?: any) {
        super(message, statusCode, response);
        this.name = 'ServerError';
    }
}
