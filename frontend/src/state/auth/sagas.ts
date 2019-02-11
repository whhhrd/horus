import { put, takeEvery, take, race } from 'redux-saga/effects'
import { push } from 'connected-react-router';

import {
    requestPasswordLogin,
    requestLogout,
    requestTokenLoad,
    API_AUTH_AUTHENTICATION_SUCCEEDED,
    API_AUTH_AUTHENTICATION_FAILED,
    API_AUTH_LOGOUT_COMPLETED,
} from '../../api'

import { 
    loginSucceededAction,
    loginFailedAction,
    LoginAction,
    SetLoginRedirectAction,
} from './actions';

import { 
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    LOAD_AUTHENTICATION_REQUESTED_ACTION,
    SET_LOGIN_REDIRECT_REQUESTED_ACTION,
 } from './constants';

 const LOGIN_REDIRECT_LS_KEY = "redirectUrl";

export function* logIn(action: LoginAction) {
    yield put(requestPasswordLogin(action.form.username, action.form.password));
    const { success, failure } = yield race({
        success: take(API_AUTH_AUTHENTICATION_SUCCEEDED),
        failure: take(API_AUTH_AUTHENTICATION_FAILED),
    });
    if (success != null) {
        yield put(loginSucceededAction());
    } else if (failure != null) {
        yield put(loginFailedAction(Error("Login failed")));
    } else {
        console.log("INVALID STATE ENCOUNTERED");
    }
}

export function* loadAuthentication() {
    yield put(requestTokenLoad());
    const { success, failure } = yield race({
        success: take(API_AUTH_AUTHENTICATION_SUCCEEDED),
        failure: take(API_AUTH_AUTHENTICATION_FAILED),
    });
    if (success != null) {
        yield put(loginSucceededAction());
    } else if (failure != null) {
        yield postLogoutRedirect();
    } else {
        console.log("INVALID STATE ENCOUNTERED");
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
        yield put(push("/"));
    }
}

export function* postLogoutRedirect() {
    yield put(push("/login"));
}

export function* setLoginRedirect(action: SetLoginRedirectAction) {
    localStorage.setItem(LOGIN_REDIRECT_LS_KEY, action.redirectUrl);
    yield;
}

export default function* authSagas() {
    yield takeEvery(LOGIN_REQUESTED_ACTION, logIn);
    yield takeEvery(SET_LOGIN_REDIRECT_REQUESTED_ACTION, setLoginRedirect)
    yield takeEvery(LOGIN_SUCCEEDED_ACTION, postLoginRedirect);
    yield takeEvery(API_AUTH_LOGOUT_COMPLETED, postLoginRedirect);
    yield takeEvery(LOAD_AUTHENTICATION_REQUESTED_ACTION, loadAuthentication);
}