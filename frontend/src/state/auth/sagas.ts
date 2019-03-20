import { push } from "connected-react-router";
import { put, race, take, takeEvery } from "redux-saga/effects";

import { notifyError } from "../notifications/constants";

import {
    API_AUTH_AUTHENTICATION_FAILED,
    API_AUTH_AUTHENTICATION_SUCCEEDED,
    API_AUTH_LOGOUT_COMPLETED,
    requestLogout,
    requestPasswordLogin,
    requestAuthCodeLogin,
    requestTokenLoad,
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
    LOGOUT_COMPLETED_ACTION,
    LOGOUT_REQUESTED_ACTION,
 } from "./constants";
import { PATH_COURSES } from "../../routes";
import { notificationsResetAction } from "../notifications/actions";

const LOGIN_REDIRECT_LS_KEY = "redirectUrl";

export function* logIn(action: LoginAction) {
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

export function* loadAuthentication() {
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

export function* logOut() {
    yield put(requestLogout());
}

export function* postLoginRedirect() {
    const redirectUrl = localStorage.getItem(LOGIN_REDIRECT_LS_KEY);
    if (redirectUrl != null) {
        yield put(push(redirectUrl));
    } else {
        yield put(push(PATH_COURSES[0]));
    }
}

export function* postLogoutRedirect() {
    yield put(push("/login"));
}

export function* handleAPILogout() {
    yield put(notificationsResetAction());
    yield put(logoutCompletedAction());
}

export function* setLoginRedirect(action: SetLoginRedirectAction) {
    localStorage.setItem(LOGIN_REDIRECT_LS_KEY, action.redirectUrl);
    yield;
}

export function* updateAuthorities(action: AuthoritiesUpdatedAction) {
    yield put(authoritiesUpdatedAction(action.authorities));
}

export function* loginFailureNotification() {
    yield put(notifyError("Authentication failed; please try again."));
}

export default function* authSagas() {
    yield takeEvery(LOGIN_REQUESTED_ACTION, logIn);
    yield takeEvery(LOGIN_FAILED_ACTION, loginFailureNotification);
    yield takeEvery(SET_LOGIN_REDIRECT_REQUESTED_ACTION, setLoginRedirect);
    yield takeEvery(LOGIN_SUCCEEDED_ACTION, postLoginRedirect);
    yield takeEvery(LOGOUT_REQUESTED_ACTION, logOut);
    yield takeEvery(LOGOUT_COMPLETED_ACTION, postLogoutRedirect);
    yield takeEvery(API_AUTH_LOGOUT_COMPLETED, handleAPILogout);
    yield takeEvery(API_AUTH_TOKEN_REFRESH_SUCCEEDED, updateAuthorities);
    yield takeEvery(LOAD_AUTHENTICATION_REQUESTED_ACTION, loadAuthentication);
}
