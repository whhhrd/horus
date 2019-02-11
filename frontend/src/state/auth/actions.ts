import { Action } from 'redux';

import {
    SET_LOGIN_REDIRECT_REQUESTED_ACTION,
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    LOGIN_FAILED_ACTION,
    LOAD_AUTHENTICATION_REQUESTED_ACTION,
} from './constants';
import { LoginForm } from './types';

export interface LoginAction extends Action<string> {
    readonly form: LoginForm;
    readonly error?: Error;
}

export interface SetLoginRedirectAction extends Action<string> {
    redirectUrl: string
}

export const setLoginRedirectAction = (redirectUrl: string) => ({ type: SET_LOGIN_REDIRECT_REQUESTED_ACTION, redirectUrl });
export const loginAction = (form: LoginForm) => ({ type: LOGIN_REQUESTED_ACTION, form });
export const loginSucceededAction = () => ({ type: LOGIN_SUCCEEDED_ACTION });
export const loginFailedAction = (error: Error) => ({ type: LOGIN_FAILED_ACTION, error });
export const loadAuthenticationAction = () => ({ type: LOAD_AUTHENTICATION_REQUESTED_ACTION });