import { push } from "connected-react-router";
import { put, race, take, takeEvery, takeLeading, call } from "redux-saga/effects";

import { notifyError } from "../notifications/constants";

import {
    API_AUTH_AUTHENTICATION_FAILED,
    API_AUTH_AUTHENTICATION_SUCCEEDED,
    API_AUTH_LOGOUT_COMPLETED,
    requestLogout,
    requestPasswordLogin,
    requestAuthCodeLogin,
    requestTokenLoad,
    authenticatedFetchJSON,
    API_AUTH_TOKEN_REFRESH_SUCCEEDED,
} from "../../api";

import {
    LoginAction,
    loginFailedAction,
    loginSucceededAction,
    SetLoginRedirectAction,
    AuthoritiesUpdatedAction,
    authoritiesUpdatedAction,
    logoutCompletedAction,
} from "./actions";

import {
    LOAD_AUTHENTICATION_REQUESTED_ACTION,
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    SET_LOGIN_REDIRECT_REQUESTED_ACTION,
    LOGIN_FAILED_ACTION,
    LOGOUT_REQUESTED_ACTION,
    AUTHORITIES_UPDATE_REQUESTED_ACTION,
 } from "./constants";
import { PATH_LOGIN, PATH_HOME } from "../../routes";
import { notificationsResetAction } from "../notifications/actions";

const LOGIN_REDIRECT_LS_KEY = "redirectUrl";

function* logIn(action: LoginAction) {
    if (action.form != null)  {
        yield put(requestPasswordLogin(action.form!.username, action.form!.password));
    } else if (action.code != null) {
        yield put(requestAuthCodeLogin(action.code!));
    }
    const { success, failure } = yield race({
        success: take(API_AUTH_AUTHENTICATION_SUCCEEDED),
        failure: take(API_AUTH_AUTHENTICATION_FAILED),
    });
    if (success != null) {
        yield put(loginSucceededAction(success.authorities));
    } else if (failure != null) {
        yield put(loginFailedAction(Error("Login failed")));
    }
}

function* loadAuthentication() {
    yield put(requestTokenLoad());
    const { success, failure } = yield race({
        success: take(API_AUTH_AUTHENTICATION_SUCCEEDED),
        failure: take(API_AUTH_AUTHENTICATION_FAILED),
    });
    if (success != null) {
        yield put(loginSucceededAction(success.authorities));
    } else if (failure != null) {
        yield put(notificationsResetAction());
        yield postLogoutRedirect();
    }
}

function* logOut() {
    yield put(requestLogout());
}

function* postLoginRedirect() {
    const redirectUrl = sessionStorage.getItem(LOGIN_REDIRECT_LS_KEY);
    if (redirectUrl != null && redirectUrl.length > 0) {
        yield put(push(redirectUrl));
        sessionStorage.removeItem(LOGIN_REDIRECT_LS_KEY);
    } else {
        yield put(push(PATH_HOME));
    }
}

function* postLogoutRedirect() {
    yield put(push(PATH_LOGIN));
}

function* handleAPILogout() {
    yield put(notificationsResetAction());
    yield postLogoutRedirect();
    yield put(logoutCompletedAction());
}

function* setLoginRedirect(action: SetLoginRedirectAction) {
    sessionStorage.setItem(LOGIN_REDIRECT_LS_KEY, action.redirectUrl);
    yield;
}

function* updateAuthorities(action: AuthoritiesUpdatedAction) {
    yield put(authoritiesUpdatedAction(action.authorities));
}

function* loginFailureNotification() {
    yield put(notifyError("Authentication failed; please try again."));
}

function* fetchAuthoritiesAction() {
    try {
        const authorities = yield call(authenticatedFetchJSON, "GET", "persons/self/permissions");
        yield put(authoritiesUpdatedAction(authorities != null ? authorities : []));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* authSagas() {
    yield takeEvery(LOGIN_REQUESTED_ACTION, logIn);
    yield takeEvery(LOGIN_FAILED_ACTION, loginFailureNotification);
    yield takeEvery(SET_LOGIN_REDIRECT_REQUESTED_ACTION, setLoginRedirect);
    yield takeEvery(LOGIN_SUCCEEDED_ACTION, postLoginRedirect);
    yield takeEvery(LOGOUT_REQUESTED_ACTION, logOut);
    yield takeEvery(API_AUTH_LOGOUT_COMPLETED, handleAPILogout);
    yield takeEvery(AUTHORITIES_UPDATE_REQUESTED_ACTION, fetchAuthoritiesAction);
    yield takeEvery(API_AUTH_TOKEN_REFRESH_SUCCEEDED, updateAuthorities);
    yield takeLeading(LOAD_AUTHENTICATION_REQUESTED_ACTION, loadAuthentication);
}
