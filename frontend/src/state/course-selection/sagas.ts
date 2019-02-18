import { coursesRequestSucceededAction } from "./action";
import { notifyError } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import { COURSES_REQUESTED_ACTION } from "./constants";
import { authenticatedFetchJSON } from "../../api";
import { CourseDtoSummary } from "../types";

export function* requestCourses() {
    try {
        const result: CourseDtoSummary[] = yield call(authenticatedFetchJSON, "GET", "courses");
        yield put(coursesRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError("Failed to fetch courses"));
    }
}

export default function* coursesSaga() {
    yield takeEvery(COURSES_REQUESTED_ACTION, requestCourses);
}