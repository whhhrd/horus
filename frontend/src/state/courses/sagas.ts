import {
    coursesRequestSucceededAction,
    CurrentParticipantRequestedAction,
    currentParticipantReceivedAction,
    CourseRequestedAction,
    CourseHideCourseSetRequestedAction,
    courseHideCourseSetRequestSucceededAction,
} from "./action";
import { notifyError } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import {
    COURSES_REQUESTED_ACTION,
    COURSE_REQUESTED_ACTION,
    CURRENT_PARTICIPANT_REQUESTED_ACTION,
    COURSE_HIDE_COURSE_SET_REQUESTED_ACTION,
} from "./constants";
import { authenticatedFetchJSON } from "../../api";
import {
    CourseDtoSummary,
    CourseDtoFull,
    ParticipantDtoBrief,
    BooleanDto,
} from "../../api/types";
import { courseRequestSucceededAction, CoursesRequestedAction } from "./action";

export function* requestCourses(action: CoursesRequestedAction) {
    const {includeHidden} = action;
    try {
        const result: CourseDtoSummary[] = yield call(
            authenticatedFetchJSON,
            "GET",
            "courses",
            {includeHidden},
        );
        yield put(coursesRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* requestCourse(action: CourseRequestedAction) {
    try {
        const result: CourseDtoFull = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.id}`,
        );
        yield put(courseRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* requestCourseSetCourseHidden(action: CourseHideCourseSetRequestedAction) {
    try {
        const { newValue } = action;
        const result: BooleanDto = yield call(
            authenticatedFetchJSON,
            "PUT",
            `courses/${action.cid}/preferences/personal/hidden`,
            null,
            newValue,
        );
        yield put(courseHideCourseSetRequestSucceededAction(action.cid, result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* getCurrentParticipant(
    action: CurrentParticipantRequestedAction,
) {
    try {
        const participant: ParticipantDtoBrief = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.cid}/participants/self`,
        );
        yield put(currentParticipantReceivedAction(participant));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* coursesSagas() {
    yield takeEvery(
        CURRENT_PARTICIPANT_REQUESTED_ACTION,
        getCurrentParticipant,
    );
    yield takeEvery(COURSES_REQUESTED_ACTION, requestCourses);
    yield takeEvery(COURSE_REQUESTED_ACTION, requestCourse);
    yield takeEvery(COURSE_HIDE_COURSE_SET_REQUESTED_ACTION, requestCourseSetCourseHidden);
}
