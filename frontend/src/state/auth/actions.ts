import { Action } from 'redux';

import {
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    LOGIN_FAILED_ACTION,
} from './constants';
import { LoginForm, LoginResponse } from './types';

export interface LoginAction extends Action<string> {
    readonly form: LoginForm;
    readonly response: LoginResponse;
    readonly error?: Error;
}

export const loginAction = (form: LoginForm) => ({ type: LOGIN_REQUESTED_ACTION, form });
export const loginSucceededAction = (response: LoginResponse) => ({ type: LOGIN_SUCCEEDED_ACTION, response });
export const loginFailedAction = (error: Error) => ({ type: LOGIN_FAILED_ACTION, error });