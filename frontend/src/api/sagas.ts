import { call, delay, fork, put, race, take } from "redux-saga/effects";

import {
    API_AUTH_AUTHENTICATION_FAILED,

    API_AUTH_AUTHENTICATION_SUCCEEDED,
    API_AUTH_LOAD_TOKEN_REQUESTED,
    API_AUTH_LOGOUT_REQUESTED,

    API_AUTH_PASSWORD_LOGIN_AUTHENTICATION_REQUESTED,
    API_AUTH_CODE_LOGIN_AUTHENTICATION_REQUESTED,
    API_AUTH_TOKEN_REFRESH_COMPLETED,
    API_AUTH_TOKEN_REFRESH_FAILED,
    API_AUTH_TOKEN_REFRESH_REQUESTED,

    API_AUTH_TOKEN_REFRESH_SUCCEEDED,

    AuthenticationType,
    API_AUTH_AUTHENTICATION_COMPLETED,
    API_AUTH_AUTHENTICATION_CANCELED,
} from "./constants";
import { FetchFunction, fetchJSON } from "./util";

import {
    eventAuthenticationCanceled,
    eventAuthenticationCompleted,
    eventAuthenticationFailed,
    eventAuthenticationRefreshCompleted,

    eventAuthenticationRefreshFailed,
    eventAuthenticationRefreshSucceeded,
    eventAuthenticationSucceeded,
    eventLogoutCompleted,

    requestAuthenticationRefresh,
    requestForcedLogout,
} from "./actions";

const backendUrl = "/api/";
const endponts = {
    accessToken: "auth/token/refresh",
    logout: "auth/logout",
    passwordLogin: "auth/login/password",
    codeLogin: "auth/login/code",
};
const LOCAL_STORAGE_REFRESH_TOKEN_KEY = "refreshToken";

interface AuthenticationState {
    authenticated: boolean;
    accessToken?: string;
    refreshToken?: string;
}
let authenticationState: AuthenticationState = {
    authenticated: false,
    accessToken: undefined,
    refreshToken: undefined,
};

function buildAuthenticationState(authenticated: boolean, refreshToken?: string, accessToken?: string)
: AuthenticationState {
    return {
        authenticated,
        accessToken,
        refreshToken,
    };
}

function loadAuthFromLocalStorage() {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    authenticationState = {
        ...authenticationState,
        refreshToken: refreshToken != null ?  refreshToken : undefined,
    };
}

function saveAuthTokenToStorage() {
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, authenticationState.refreshToken!);
}

export function* authenticationFlow() {
    yield fork(authenticationFlowLoop);
}

/**
 * Main authentication loop which runs to login, refresh tokens, etc.
 */
function* authenticationFlowLoop() {

    // Load refresh token from storage
    loadAuthFromLocalStorage();

    while (true) {

        // Wait for a login request or a token refresh auth action
        const { loadTokenRequest, passwordLoginRequest, authCodeLoginRequest } = yield race({
            loadTokenRequest: take(API_AUTH_LOAD_TOKEN_REQUESTED),
            passwordLoginRequest: take(API_AUTH_PASSWORD_LOGIN_AUTHENTICATION_REQUESTED),
            authCodeLoginRequest: take(API_AUTH_CODE_LOGIN_AUTHENTICATION_REQUESTED),
        });

        const authenticationType = {
            ...loadTokenRequest,
            ...passwordLoginRequest,
            ...authCodeLoginRequest,
        }.type;

        // Load token or do auth
        if (loadTokenRequest != null) {
            yield fork(loadToken, authenticationState.refreshToken ? authenticationState.refreshToken : "");
        } else if (passwordLoginRequest != null) {
            yield fork(passwordLogin, passwordLoginRequest.username, passwordLoginRequest.password);
        } else if (authCodeLoginRequest != null) {
            yield fork(codeLogin, authCodeLoginRequest.code);
        }

        // See how things went, or was a logout requested
        const { authenticationSuccess, authenticationFailure } = yield race({
            authenticationSuccess: take(API_AUTH_AUTHENTICATION_SUCCEEDED),
            authenticationFailure: take(API_AUTH_AUTHENTICATION_FAILED),
            logoutRequest: take(API_AUTH_LOGOUT_REQUESTED),
        });

        if (authenticationSuccess != null) {
            authenticationState = buildAuthenticationState(
                true,
                authenticationSuccess.refreshToken,
                authenticationSuccess.accessToken,
            );
            saveAuthTokenToStorage();

            yield put(eventAuthenticationSucceeded(
                authenticationType,
                authenticationSuccess.refreshToken,
                authenticationSuccess.accessToken,
            ));
        } else if (authenticationFailure != null) {
            authenticationState = buildAuthenticationState(false, undefined, undefined);

            yield put(eventAuthenticationFailed(authenticationType, authenticationFailure.error));
        } else {
            authenticationState = buildAuthenticationState(false, undefined, undefined);

            yield put(eventAuthenticationCanceled(authenticationType));
        }

        yield put(eventAuthenticationCompleted(authenticationType));

        // Token refresh loop
        while (authenticationState.authenticated) {
            const { authRefreshRequest, authRefreshTimeout } = yield race({
                authRefreshRequest: take(API_AUTH_TOKEN_REFRESH_REQUESTED),
                authRefreshTimeout: delay(270000), // 4.5 minutes
                logoutRequest: take(API_AUTH_LOGOUT_REQUESTED),
            });

            if (authRefreshRequest != null || authRefreshTimeout != null) {
                yield fork(updateAccessToken, authenticationState.refreshToken!);
            } else {
                yield call(logout, authenticationState.refreshToken!);

                authenticationState = buildAuthenticationState(false, undefined, undefined);

                yield put(eventLogoutCompleted());

                continue;
            }

            const { authRefreshSuccess, authRefreshFailure } = yield race({
                authRefreshSuccess: take(API_AUTH_TOKEN_REFRESH_SUCCEEDED),
                authRefreshFailure: take(API_AUTH_TOKEN_REFRESH_FAILED),
                logoutRequest: take(API_AUTH_LOGOUT_REQUESTED),
            });

            if (authRefreshSuccess != null) {

                authenticationState = {
                    ...authenticationState,
                    accessToken: authRefreshSuccess.accessToken,
                };

                // TODO: SOMETHING HERE TO UPDATE USER PERMISSIONS (after re-receiving)

                yield put(eventAuthenticationRefreshCompleted());
            } else if (authRefreshFailure != null) {
                yield put(requestForcedLogout(authRefreshFailure.error));

                yield call(logout, authenticationState.refreshToken!);

                authenticationState = buildAuthenticationState(false, undefined, undefined);

                yield put(eventAuthenticationRefreshCompleted());

                yield put(eventLogoutCompleted());
            } else {
                yield call(logout, authenticationState.refreshToken!);

                authenticationState = buildAuthenticationState(false, undefined, undefined);

                yield put(eventAuthenticationRefreshCompleted());

                yield put(eventLogoutCompleted());
            }
        }
    }
}

/**
 * Fetch a new access token from  a refresh token.
 * @param refreshToken
 */
function* fetchAccessToken(refreshToken: string) {
    return yield call(asyncCallBackendFetch, fetchJSON, "POST", endponts.accessToken, null, null, refreshToken);
}

/**
 * Refresh the current access token and dispatch a refresh succeeded/failed event
 * @param refreshToken the refresh token to use
 */
function* updateAccessToken(refreshToken: string) {
    try {
        const { accessToken } = yield* fetchAccessToken(refreshToken);

        yield put(eventAuthenticationRefreshSucceeded(accessToken));
    } catch (error) {
        yield put(eventAuthenticationRefreshFailed(error));
    }
}

/**
 * Load a new access token and dispatch and authentican succeeded/failed actions
 * @param refreshToken the refresh token
 */
function* loadToken(refreshToken: string) {
    try {
        const { accessToken } = yield* fetchAccessToken(refreshToken);

        yield put(eventAuthenticationSucceeded(AuthenticationType.SAVED_TOKEN, refreshToken, accessToken));
    } catch (error) {
        yield put(eventAuthenticationFailed(AuthenticationType.SAVED_TOKEN, error));
    }
}

/**
 * Login with password via the API
 * @param username username
 * @param password password
 */
function* passwordLogin(username: string, password: string) {
    try {
        const { accessToken, refreshToken } = yield call(
            asyncCallBackendFetch,
            fetchJSON,
            "POST",
            endponts.passwordLogin,
            null,
            { username, password },
        );
        yield put(eventAuthenticationSucceeded(AuthenticationType.PASSWORD_LOGIN, refreshToken, accessToken));
    } catch (error) {
        yield put(eventAuthenticationFailed(AuthenticationType.PASSWORD_LOGIN, error));
    }
}

/**
 * Login with auth code via the API
 * @param code authentication code
 */
function* codeLogin(code: string) {
    try {
        const { accessToken, refreshToken } = yield call(
            asyncCallBackendFetch,
            fetchJSON,
            "POST",
            endponts.codeLogin,
            null,
            {},
            code,
        );
        yield put(eventAuthenticationSucceeded(AuthenticationType.AUTH_CODE, refreshToken, accessToken));
    } catch (error) {
        yield put(eventAuthenticationFailed(AuthenticationType.AUTH_CODE, error));
    }
}

/**
 * Log out and revoke token
 * @param refreshToken refresh token to revoke
 */
function* logout(refreshToken: string) {
    try {
        yield call(asyncCallBackendFetch, fetchJSON, "POST", endponts.logout, null, null, refreshToken);
    } catch (error) {
        // do nothing now
    }
}

/**
 * Authenticated fetch JSON from the backend using access token
 * @param method HTTP method to use
 * @param path path of the request
 * @param query map of query parameters
 * @param body request body
 * @param headers map of headers to use for request
 * @param options additional request options
 */
export function* authenticatedFetchJSON(
    method: string,
    path: string,
    query: object | null = null,
    body: object | null = null,
    headers = {},
    options = {}) {
    return yield call(authenticatedFetch, fetchJSON, method, path, query, body, false, headers, options);
}

/**
 * Authenticated fetch from the backend
 * @param fetchFunction the FetchFunction to use for the fetching
 * @param method HTTP method to use
 * @param path path of the request
 * @param query map of query parameters
 * @param body request body
 * @param useRefreshToken whether to use the refresh token for authentication
 * @param headers map of headers to use for request
 * @param options additional request options
 */
export function* authenticatedFetch(
    fetchFunction: FetchFunction,
    method: string,
    path: string,
    query: object | null = null,
    body: object | null = null,
    useRefreshToken = false,
    headers = {},
    options = {},
) {

    // If unauthenticated and if we're not using the refresh token,
    // wait for authentication or for an authentication failure
    if (!authenticationState.authenticated && !useRefreshToken) {
        const { failed, canceled } = yield race({
            completed: take(API_AUTH_AUTHENTICATION_COMPLETED),
            failed: take(API_AUTH_AUTHENTICATION_FAILED),
            canceled: take(API_AUTH_AUTHENTICATION_CANCELED),
        });
        if (canceled != null || failed != null) {
            return;
        }
    }

    let authState = {
        ...authenticationState,
    };

    let token = (useRefreshToken ? authState.refreshToken : authState.accessToken);

    try {
        return yield call(asyncCallBackendFetch, fetchFunction, method, path, query, body, token, headers, options);
    } catch (error) {
        if (error.status !== 401) {
            throw error;
        }
    }

    yield put(requestAuthenticationRefresh());

    yield take(API_AUTH_TOKEN_REFRESH_COMPLETED);

    authState = { ...authenticationState };

    if (!authState.authenticated) {
        throw Error("js.fetch.auth.Unauthorized");
    } else if (useRefreshToken) {
        throw Error("js.fetch.auth.InvalidState");
    }

    token = authState.accessToken;

    try {
        return yield call(asyncCallBackendFetch, fetchFunction, method, path, query, body, token, headers, options);
    } catch (error) {
        if (error.status === 401) {
            throw Error("js.fetch.auth.InvalidState");
        } else {
            throw error;
        }
    }
}

/**
 * Asynchronously fetch from a URL
 * @param fetchFunction the FetchFunction to use for the fetching
 * @param method HTTP method to use
 * @param url URL to use
 * @param query map of query parameters
 * @param body request body
 * @param headers map of headers to use for request
 * @param options additional request options
 */
async function asyncCallFetch(
    fetchFunction: FetchFunction,
    method: string,
    url: string,
    query: object | null = null,
    body: object | null = null,
    headers = {},
    options = {},
) {

    let fetchUrl = url;
    if (query) {
        const queryString = Object.entries(query).map(([ name, value ]) => {
            if (Array.isArray(value)) {
                const arrayFiltered = value.filter((arrayVal) => !!arrayVal);
                if (arrayFiltered.length > 0) {
                    return value.filter((arrayVal) => !!arrayVal)
                        .map(
                            (arrayVal) => `${encodeURIComponent(name)}=${encodeURIComponent(arrayVal)}`,
                        ).join("&");
                } else {
                    return null;
                }
            } else if (value != null) {
                return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
            } else {
                return null;
            }
        }).filter((e) => !!e).join("&");
        if (queryString !== "") {
            fetchUrl += `?${queryString}`;
        }
    }
    return await fetchFunction(fetchUrl, {
        ...options,
        method,
        headers,
        body,
    });
}
/**
 * Asynchronously fetch from the backend
 * @param fetchFunction the FetchFunction to use for the fetching
 * @param method HTTP method to use
 * @param path path of the request
 * @param query map of query parameters
 * @param body request body
 * @param token token to use for the request
 * @param headers map of headers to use for request
 * @param options additional request options
 */
async function asyncCallBackendFetch(
    fetchFunction: FetchFunction,
    method: string,
    path: string,
    query: object | null = null,
    body: object | null = null,
    token: string | null = null,
    headers = {},
    options = {},
) {
    let newHeaders = headers;
    if (token != null) {
        newHeaders = {
            ...newHeaders,
            Authorization: `Bearer ${token}`,
        };
    }
    return await asyncCallFetch(fetchFunction, method, backendUrl + path, query, body, newHeaders, options);
}
