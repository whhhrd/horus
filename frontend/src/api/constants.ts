export const API_AUTH_LOAD_TOKEN_REQUESTED = "api/auth/LOAD_TOKEN_REQUESTED";

export const API_AUTH_PASSWORD_LOGIN_AUTHENTICATION_REQUESTED =
    "api/auth/PASSWORD_LOGIN_AUTHENTICATION_REQUESTED";
export const API_AUTH_CODE_LOGIN_AUTHENTICATION_REQUESTED =
    "api/auth/CODE_LOGIN_AUTHENTICATION_REQUESTED";

export const API_AUTH_AUTHENTICATION_STARTED =
    "api/auth/AUTHENTICATION_STARTED";
export const API_AUTH_AUTHENTICATION_SUCCEEDED =
    "api/auth/AUTHENTICATION_SUCCEEDED";
export const API_AUTH_AUTHENTICATION_CANCELED =
    "api/auth/AUTHENTICATION_CANCELED";
export const API_AUTH_AUTHENTICATION_FAILED = "api/auth/AUTHENTICATION_FAILED";
export const API_AUTH_AUTHENTICATION_COMPLETED =
    "api/auth/AUTHENTICATION_COMPLETED";

export const API_AUTH_TOKEN_REFRESH_REQUESTED =
    "api/auth/TOKEN_REFRESH_REQUESTED";
export const API_AUTH_TOKEN_REFRESH_SUCCEEDED =
    "api/auth/TOKEN_REFRESH_SUCCEEDED";
export const API_AUTH_TOKEN_REFRESH_FAILED = "api/auth/TOKEN_REFRESH_FAILED";
export const API_AUTH_TOKEN_REFRESH_COMPLETED = "api/TOKEN_REFRESH_COMPLETED";

export const API_AUTH_LOGOUT_REQUESTED = "api/auth/LOGOUT_REQUESTED";
export const API_AUTH_LOGOUT_FORCED = "api/auth/LOGOUT_FORCED";
export const API_AUTH_LOGOUT_COMPLETED = "api/auth/LOGOUT_COMPLETED";

export enum AuthenticationType {
    SAVED_TOKEN,
    PASSWORD_LOGIN,
    AUTH_CODE,
}

export class APIError extends Error {
    code: number | null;
    constructor(message: string, code: number | null = null) {
        super(message);
        this.name = "APIError";
        this.code = code;
    }
}
