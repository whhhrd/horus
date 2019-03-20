import { put, takeEvery, call } from "redux-saga/effects";

import { authenticatedFetchJSON } from "../../api/sagas";
import {
    studentDashboardDataRequestSucceededAction,
    StudentDashboardDataRequestedAction,
} from "./actions";
import { STUDENT_DASHBOARD_DATA_REQUESTED_ACTION } from "./constants";
import { notifyError } from "../notifications/constants";
import { StudentDashboardDto } from "../../api/types";

export function* requestStudentDashboardData(
    action: StudentDashboardDataRequestedAction,
) {
    try {
        const result: StudentDashboardDto = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.cid}/studentDashboard`,
        );
        yield put(studentDashboardDataRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError("Failed to retrieve your information"));
    }
}

export default function* studentDashboardSagas() {
    yield takeEvery(
        STUDENT_DASHBOARD_DATA_REQUESTED_ACTION,
        requestStudentDashboardData,
    );
}
