import { StudentDashboardDataRequestSucceededAction } from "./actions";
import { STUDENT_DASHBOARD_DATA_REQUEST_SUCCEEDED_ACTION } from "./constants";
import { StudentDashboardState } from "./types";

export default function studentDashboardReducer(state: StudentDashboardState,
                                                action: StudentDashboardDataRequestSucceededAction) {
    if (state === undefined) {
        return null;
    }
    return action.type === STUDENT_DASHBOARD_DATA_REQUEST_SUCCEEDED_ACTION ? action.result : state;
}
