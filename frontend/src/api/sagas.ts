import { call, put, race, delay, take, fork} from 'redux-saga/effects';

import { fetchJSON, FetchFunction } from './util'
import {
    API_AUTH_LOAD_TOKEN_REQUESTED,

    API_AUTH_PASSWORD_LOGIN_AUTHENTICATION_REQUESTED,
    API_AUTH_AUTHENTICATION_SUCCEEDED,
    API_AUTH_AUTHENTICATION_FAILED,

    API_AUTH_TOKEN_REFRESH_REQUESTED,
    API_AUTH_TOKEN_REFRESH_SUCCEEDED,
    API_AUTH_TOKEN_REFRESH_FAILED,
    API_AUTH_TOKEN_REFRESH_COMPLETED,

    API_AUTH_LOGOUT_REQUESTED,

    AuthenticationType

} from './constants'

import {
    eventAuthenticationSucceeded,
    eventAuthenticationFailed,
    eventAuthenticationCanceled,
    eventAuthenticationCompleted,

    requestAuthenticationRefresh,
    eventAuthenticationRefreshSucceeded,
    eventAuthenticationRefreshFailed,
    eventAuthenticationRefreshCompleted,

    requestForcedLogout,
    eventLogoutCompleted

} from './actions'

const _backendUrl = "/api/"
const _endpoints = {
    passwordLogin: "auth/login/password",
    logout: "auth/logout",
    accessToken: "auth/token/refresh"
}
const LOCAL_STORAGE_REFRESH_TOKEN_KEY = "refreshToken";

interface AuthenticationState {
    authenticated: boolean,
    accessToken?: string,
    refreshToken?: string
}
var _authenticationState: AuthenticationState = {
    authenticated: false,
    accessToken: undefined,
    refreshToken: undefined
}

function buildAuthenticationState(authenticated: boolean, refreshToken?: string, accessToken?: string): AuthenticationState {
    return {
        authenticated: authenticated,
        accessToken: accessToken,
        refreshToken: refreshToken
    }
}

function loadAuthFromLocalStorage() {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY)
    _authenticationState = {
        ..._authenticationState,
        refreshToken: refreshToken != null ?  refreshToken: undefined
    }
}

function saveAuthTokenToStorage() {
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, _authenticationState.refreshToken!)
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
		const { loadTokenRequest, passwordLoginRequest } = yield race({
			loadTokenRequest: take(API_AUTH_LOAD_TOKEN_REQUESTED),
			passwordLoginRequest: take(API_AUTH_PASSWORD_LOGIN_AUTHENTICATION_REQUESTED),
        });

        const authenticationType = {
			...loadTokenRequest,
			...passwordLoginRequest,
		}.type;


        // Load token or do auth
		if (loadTokenRequest != null) {
			yield fork(loadToken, _authenticationState.refreshToken ? _authenticationState.refreshToken: "");
		} else if (passwordLoginRequest != null) {
			yield fork(passwordLogin, passwordLoginRequest.username, passwordLoginRequest.password);
		}

        // See how things went, or was a logout requested
		const { authenticationSuccess, authenticationFailure } = yield race({
			authenticationSuccess: take(API_AUTH_AUTHENTICATION_SUCCEEDED),
			authenticationFailure: take(API_AUTH_AUTHENTICATION_FAILED),
			logoutRequest: take(API_AUTH_LOGOUT_REQUESTED),
		});

		if (authenticationSuccess != null) {
            _authenticationState = buildAuthenticationState(true, authenticationSuccess.refreshToken, authenticationSuccess.accessToken);
            saveAuthTokenToStorage();

			yield put(eventAuthenticationSucceeded(authenticationType, authenticationSuccess.refreshToken, authenticationSuccess.accessToken));
		} else if (authenticationFailure != null) {
			_authenticationState = buildAuthenticationState(false, undefined, undefined);

			yield put(eventAuthenticationFailed(authenticationType, authenticationFailure.error));
		} else {
			_authenticationState = buildAuthenticationState(false, undefined, undefined);

			yield put(eventAuthenticationCanceled(authenticationType));
		}

		yield put(eventAuthenticationCompleted(authenticationType));

        // Token refresh loop
		while (_authenticationState.authenticated) {
			const { authRefreshRequest, authRefreshTimeout } = yield race({
				authRefreshRequest: take(API_AUTH_TOKEN_REFRESH_REQUESTED),
				authRefreshTimeout: delay(270000), // 4.5 minutes
				logoutRequest: take(API_AUTH_LOGOUT_REQUESTED),
			});

			if (authRefreshRequest != null || authRefreshTimeout != null) {
				yield fork(updateAccessToken, _authenticationState.refreshToken!);
			} else {
				yield call(logout, _authenticationState.refreshToken!);

				_authenticationState = buildAuthenticationState(false, undefined, undefined);

				yield put(eventLogoutCompleted());

				continue;
			}

			const { authRefreshSuccess, authRefreshFailure } = yield race({
				authRefreshSuccess: take(API_AUTH_TOKEN_REFRESH_SUCCEEDED),
				authRefreshFailure: take(API_AUTH_TOKEN_REFRESH_FAILED),
				logoutRequest: take(API_AUTH_LOGOUT_REQUESTED),
			});

			if (authRefreshSuccess != null) {
                
				_authenticationState = {
					..._authenticationState,
					accessToken: authRefreshSuccess.accessToken,
				};

                // TODO: SOMETHING HERE TO UPDATE USER PERMISSIONS (after re-receiving)

				yield put(eventAuthenticationRefreshCompleted());
			} else if (authRefreshFailure != null) {
				yield put(requestForcedLogout(authRefreshFailure.error));

				yield call(logout, _authenticationState.refreshToken!);

				_authenticationState = buildAuthenticationState(false, undefined, undefined);

				yield put(eventAuthenticationRefreshCompleted());

				yield put(eventLogoutCompleted());
			} else {
				yield call(logout, _authenticationState.refreshToken!);

				_authenticationState = buildAuthenticationState(false, undefined, undefined);

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
	return yield call(asyncCallBackendFetch, fetchJSON, 'POST', _endpoints.accessToken, null, null, refreshToken);
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
        const { accessToken, refreshToken } = yield call(asyncCallBackendFetch, fetchJSON, 'POST', _endpoints.passwordLogin, null, { username: username, password: password });
		yield put(eventAuthenticationSucceeded(AuthenticationType.PASSWORD_LOGIN, refreshToken, accessToken));
	} catch (error) {
		yield put(eventAuthenticationFailed(AuthenticationType.PASSWORD_LOGIN, error));
	}
}

/**
 * Log out and revoke token
 * @param refreshToken refresh token to revoke
 */
function* logout(refreshToken: string) {
	try {
		yield call(asyncCallBackendFetch, fetchJSON, 'POST', _endpoints.logout, null, null, refreshToken);
	} catch (error) { }
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
export function* authenticatedFetchJSON(method: string, path: string, query: Object | null = null, body: Object | null = null, headers = {}, options = {}) {
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
export function* authenticatedFetch(fetchFunction: FetchFunction, method: string, path: string, query: Object | null = null, body: Object | null = null, useRefreshToken = false, headers = {}, options = {}) {
	let authenticationState = { ..._authenticationState };

	let token = (useRefreshToken ? authenticationState.refreshToken : authenticationState.accessToken);

	try {
		return yield call(asyncCallBackendFetch, fetchFunction, method, path, query, body, token, headers, options);
	} catch (error) {
		if (error.status !== 401) {
			throw error;
		}
	}

	yield put(requestAuthenticationRefresh());

	yield take(API_AUTH_TOKEN_REFRESH_COMPLETED);

	authenticationState = { ..._authenticationState };

	if (!authenticationState.authenticated) {
		throw Error('js.fetch.auth.Unauthorized');
	} else if (useRefreshToken) {
		throw Error('js.fetch.auth.InvalidState');
	}

	token = authenticationState.accessToken;

	try {
		return yield call(asyncCallBackendFetch, fetchFunction, method, path, query, body, token, headers, options);
	} catch (error) {
		if (error.status === 401) {
			throw Error('js.fetch.auth.InvalidState');
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
async function asyncCallFetch(fetchFunction: FetchFunction, method: string, url: string, query: Object | null = null, body: Object | null = null, headers = {}, options = {}) {
	let fetchUrl = url;
	if (query) {
		const queryString = Object.entries(query).map(([ name, value ]) => {
			if (Array.isArray(value)) {
				const arrayFiltered = value.filter(arrayVal => !!arrayVal);
				if (arrayFiltered.length > 0) {
					return value.filter(arrayVal => !!arrayVal).map(arrayVal => `${encodeURIComponent(name)}=${encodeURIComponent(arrayVal)}`).join('&');
				} else {
					return null;
				}
			} else if (value != null) {
				return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
			} else {
				return null;
			}
		}).filter(e => !!e).join('&');
		if (queryString !== '') {
			fetchUrl += `?${queryString}`;
		}
	}
	return await fetchFunction(fetchUrl, {
		...options,
		method: method,
		headers: headers,
		body: body,
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
async function asyncCallBackendFetch(fetchFunction: FetchFunction, method: string, path: string, query: Object | null = null, body: Object | null = null, token: string | null = null, headers = {}, options = {}) {
	let newHeaders = headers;
	if (token != null) {
		newHeaders = {
			...newHeaders,
			'Authorization': `Bearer ${token}`,
		};
    }
	return await asyncCallFetch(fetchFunction, method, _backendUrl + path, query, body, newHeaders, options);
}
