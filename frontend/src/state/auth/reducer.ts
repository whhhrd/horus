import {
    LOGIN_FAILED_ACTION,
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    AUTHORITIES_UPDATED_ACTION,
    LOGOUT_COMPLETED_ACTION,
} from "./constants";

import {
    LoginAction,
} from "./actions";
import { AuthState } from "./types";
import CoursePermissions from "../../api/permissions";

const initialState: AuthState = {
    loggedIn: false,
    coursePermissions: new CoursePermissions([]),
    error: null,
};

function authReducer(state: AuthState, action: LoginAction): AuthState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case LOGIN_REQUESTED_ACTION:
        case LOGOUT_COMPLETED_ACTION:
            return initialState;
        case LOGIN_SUCCEEDED_ACTION:
            return {
                loggedIn: true,
                coursePermissions: new CoursePermissions(action.authorities),
                error: null,
            };
        case LOGIN_FAILED_ACTION:
            return {
                ...initialState,
                error: action.error != null ? action.error : null,
            };
        case AUTHORITIES_UPDATED_ACTION:
            return {
                ...state,
                coursePermissions: new CoursePermissions(action.authorities),
            };
        default:
            return state;
    }
}

export default authReducer;
