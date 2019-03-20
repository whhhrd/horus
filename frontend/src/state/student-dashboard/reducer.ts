import { StudentDashboardDataRequestSucceededAction } from "./actions";
import {
    STUDENT_DASHBOARD_DATA_REQUEST_SUCCEEDED_ACTION,
    STUDENT_DASHBOARD_DATA_REQUESTED_ACTION,
} from "./constants";
import { StudentDashboardState } from "./types";

const initialState: StudentDashboardState = {
    dashboard: null,
};

export default function studentDashboardReducer(
    state: StudentDashboardState,
    action: StudentDashboardDataRequestSucceededAction,
) {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case STUDENT_DASHBOARD_DATA_REQUESTED_ACTION:
            return {
                ...state,
                dashboard: null,
            };
        case STUDENT_DASHBOARD_DATA_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                dashboard: action.result,
            };
        default:
            return state;
    }
}
