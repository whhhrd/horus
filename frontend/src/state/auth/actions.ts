import { Action } from "redux";

import {
    LOAD_AUTHENTICATION_REQUESTED_ACTION,
    LOGIN_FAILED_ACTION,
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    SET_LOGIN_REDIRECT_REQUESTED_ACTION,
} from "./constants";
import { LoginForm } from "./types";

export interface LoginAction extends Action<string> {
    readonly form: LoginForm | null;
    readonly code: string | null;
    readonly error?: Error;
}

export interface SetLoginRedirectAction extends Action<string> {
    redirectUrl: string;
}

export const setLoginRedirectAction = (redirectUrl: string) => (
    { type: SET_LOGIN_REDIRECT_REQUESTED_ACTION, redirectUrl }
);
export const loginAction = (form: LoginForm | null, code: string | null) => (
    { type: LOGIN_REQUESTED_ACTION, form, code}
);
export const loginSucceededAction = () => ({ type: LOGIN_SUCCEEDED_ACTION });
export const loginFailedAction = (error: Error) => ({ type: LOGIN_FAILED_ACTION, error });
export const loadAuthenticationAction = () => ({ type: LOAD_AUTHENTICATION_REQUESTED_ACTION });
