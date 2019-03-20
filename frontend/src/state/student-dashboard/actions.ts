import { STUDENT_DASHBOARD_DATA_REQUESTED_ACTION, STUDENT_DASHBOARD_DATA_REQUEST_SUCCEEDED_ACTION } from "./constants";
import { Action } from "redux";
import { StudentDashboardDto } from "../../api/types";

export interface StudentDashboardDataRequestSucceededAction extends Action<string> {
    readonly result: StudentDashboardDto;
}
export interface StudentDashboardDataRequestedAction extends Action<string> {
    readonly cid: number;
}
export const studentDashboardDataRequestedAction = (cid: number) => ({
    type: STUDENT_DASHBOARD_DATA_REQUESTED_ACTION, cid,
});
export const studentDashboardDataRequestSucceededAction = (result: StudentDashboardDto) => ({
    type: STUDENT_DASHBOARD_DATA_REQUEST_SUCCEEDED_ACTION, result,
});
