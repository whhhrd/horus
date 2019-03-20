import { Action } from "redux";

import {
    LOAD_AUTHENTICATION_REQUESTED_ACTION,
    LOGIN_FAILED_ACTION,
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    SET_LOGIN_REDIRECT_REQUESTED_ACTION,
    AUTHORITIES_UPDATED_ACTION,
    LOGOUT_COMPLETED_ACTION,
    LOGOUT_REQUESTED_ACTION,
} from "./constants";
import { LoginForm } from "./types";
import { HorusAuthorityDto } from "../../api/types";

export interface LoginAction extends Action<string> {
    readonly form: LoginForm | null;
    readonly authorities: HorusAuthorityDto[];
    readonly code: string | null;
    readonly error?: Error;
}

export interface SetLoginRedirectAction extends Action<string> {
    redirectUrl: string;
}

export interface AuthoritiesUpdatedAction extends Action<string> {
    readonly authorities: HorusAuthorityDto[];
}

export const setLoginRedirectAction = (redirectUrl: string) => (
    { type: SET_LOGIN_REDIRECT_REQUESTED_ACTION, redirectUrl }
);

export const loginAction = (form: LoginForm | null, code: string | null) => (
    { type: LOGIN_REQUESTED_ACTION, form, code}
);

export const loginSucceededAction = (authorities: HorusAuthorityDto[]) => (
    { type: LOGIN_SUCCEEDED_ACTION, authorities});

export const loginFailedAction = (error: Error) => ({ type: LOGIN_FAILED_ACTION, error });

export const loadAuthenticationAction = () => ({ type: LOAD_AUTHENTICATION_REQUESTED_ACTION });

export const authoritiesUpdatedAction = (authorities: HorusAuthorityDto[]) => (
    { type: AUTHORITIES_UPDATED_ACTION, authorities});

export const logoutCompletedAction = () => (
    { type: LOGOUT_COMPLETED_ACTION }
);

export const logoutRequestedAction = () => (
    { type: LOGOUT_REQUESTED_ACTION }
);
