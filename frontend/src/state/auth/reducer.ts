import {
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    LOGIN_FAILED_ACTION,
} from './constants';

import {
    LoginAction
} from './actions';
import { AuthState } from './types';

const initialState: AuthState = {
    loggedIn: false,
    error: undefined,
};

function authReducer(state: AuthState, action: LoginAction): AuthState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case LOGIN_REQUESTED_ACTION:
            return initialState;
        case LOGIN_SUCCEEDED_ACTION:
            return {
                loggedIn: true,
                error: undefined,
            };
        case LOGIN_FAILED_ACTION:
            return {
                ...initialState,
                error: action.error,
            }
        default:
            return state;
    }
}

export default authReducer;