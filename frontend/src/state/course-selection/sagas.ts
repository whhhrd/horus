import { coursesRequestSucceededAction } from "./action";
import { notifyError } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import { COURSES_REQUESTED_ACTION, COURSE_REQUESTED_ACTION } from "./constants";
import { authenticatedFetchJSON } from "../../api";
import { CourseDtoSummary, CourseDtoFull } from "../types";
import { courseRequestSucceededAction, CoursesRequestedAction } from "./action";

export function* requestCourses() {
    try {
        const result: CourseDtoSummary[] = yield call(authenticatedFetchJSON, "GET", "courses");
        yield put(coursesRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError("Failed to fetch courses"));
    }
}

export function* requestCourse(action: CoursesRequestedAction) {
    try {
        const result: CourseDtoFull = yield call(authenticatedFetchJSON, "GET", `courses/${action.id}`);
        yield put(courseRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError("Failed to fetch courseDtoFull"));
    }
}

export default function* coursesSagas() {
    yield takeEvery(COURSES_REQUESTED_ACTION, requestCourses);
    yield takeEvery(COURSE_REQUESTED_ACTION, requestCourse);
}
