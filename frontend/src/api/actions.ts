import {
    API_AUTH_AUTHENTICATION_CANCELED,

    API_AUTH_AUTHENTICATION_COMPLETED,
    API_AUTH_AUTHENTICATION_FAILED,
    API_AUTH_AUTHENTICATION_STARTED,
    API_AUTH_AUTHENTICATION_SUCCEEDED,
    API_AUTH_LOAD_TOKEN_REQUESTED,
    API_AUTH_LOGOUT_COMPLETED,

    API_AUTH_LOGOUT_FORCED,
    API_AUTH_LOGOUT_REQUESTED,
    API_AUTH_PASSWORD_LOGIN_AUTHENTICATION_REQUESTED,
    API_AUTH_TOKEN_REFRESH_COMPLETED,

    API_AUTH_TOKEN_REFRESH_FAILED,
    API_AUTH_TOKEN_REFRESH_REQUESTED,
    API_AUTH_TOKEN_REFRESH_SUCCEEDED,

    AuthenticationType,
} from "./constants";

export const requestTokenLoad = () => ({ type: API_AUTH_LOAD_TOKEN_REQUESTED });
export const requestPasswordLogin = (username: string, password: string) => (
    { type: API_AUTH_PASSWORD_LOGIN_AUTHENTICATION_REQUESTED, username, password });
export const eventAuthenticationStarted = (authenticationType: AuthenticationType) => (
    { type: API_AUTH_AUTHENTICATION_STARTED, authenticationType });
export const eventAuthenticationSucceeded = (
    authenticationType: AuthenticationType, refreshToken: string, accessToken: string,
    ) => (
    { type: API_AUTH_AUTHENTICATION_SUCCEEDED, authenticationType, refreshToken, accessToken});
export const eventAuthenticationFailed = (authenticationType: AuthenticationType, error: Error) => (
    { type: API_AUTH_AUTHENTICATION_FAILED, authenticationType, error });
export const eventAuthenticationCanceled = (authenticationType: AuthenticationType) => (
    { type: API_AUTH_AUTHENTICATION_CANCELED, authenticationType });
export const eventAuthenticationCompleted = (authenticationType: AuthenticationType) => (
    { type: API_AUTH_AUTHENTICATION_COMPLETED, authenticationType });
export const requestAuthenticationRefresh = () => ({ type: API_AUTH_TOKEN_REFRESH_REQUESTED });
export const eventAuthenticationRefreshSucceeded = (accessToken: string) => (
    { type: API_AUTH_TOKEN_REFRESH_SUCCEEDED, accessToken });
export const eventAuthenticationRefreshFailed = (error: Error) => (
    { type: API_AUTH_TOKEN_REFRESH_FAILED, error });
export const eventAuthenticationRefreshCompleted = () => (
    { type: API_AUTH_TOKEN_REFRESH_COMPLETED });
export const requestLogout = () => ({ type: API_AUTH_LOGOUT_REQUESTED });
export const requestForcedLogout = (error: Error) => ({ type: API_AUTH_LOGOUT_FORCED, error });
export const eventLogoutCompleted = () => ({ type: API_AUTH_LOGOUT_COMPLETED });
