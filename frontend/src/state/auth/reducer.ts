import {
    LOGIN_FAILED_ACTION,
    LOGIN_REQUESTED_ACTION,
    LOGIN_SUCCEEDED_ACTION,
    AUTHORITIES_UPDATED_ACTION,
} from "./constants";

import {
    LoginAction,
} from "./actions";
import { AuthState } from "./types";
import CoursePermissions from "../../api/permissions";

const initialState: AuthState = {
    loggedIn: false,
    coursePermissions: new CoursePermissions([]),
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
                coursePermissions: new CoursePermissions(action.authorities),
                error: undefined,
            };
        case LOGIN_FAILED_ACTION:
            return {
                ...initialState,
                error: action.error,
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
