import { put, takeEvery } from 'redux-saga/effects'
import { push } from 'connected-react-router';

import { 
    loginSucceededAction,
    loginFailedAction,
    LoginAction,
} from './actions';
import { LOGIN_REQUESTED_ACTION, LOGIN_SUCCEEDED_ACTION } from './constants';

export function* logIn(action: LoginAction) {
    const valid = action.form.username === "s1234567" && action.form.password === "password";
    if (valid) {
        console.log("Login succeeded");
        yield put(loginSucceededAction({accessToken: "accesToken123", refreshToken: "refreshToken123"}));
    } else {
        console.log("Login failed", action.form);
        yield put(loginFailedAction(Error("Login failed")));
    }
}

export function* loginRedirect() {
    console.log("Redirect")
    yield put(push("../"));
}

export default function* authSagas() {
    yield takeEvery(LOGIN_REQUESTED_ACTION, logIn);
    yield takeEvery(LOGIN_SUCCEEDED_ACTION, loginRedirect);
}