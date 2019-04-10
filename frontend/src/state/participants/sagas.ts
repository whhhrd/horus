import { put, takeEvery, call } from "redux-saga/effects";

import { authenticatedFetchJSON } from "../../api/sagas";
import { notifyError } from "../notifications/constants";
import {
    ParticipantsFetchAction,
    participantsFetchSucceededAction,
    courseParticipantsFetchSucceededAction,
    CourseParticipantsFetchAction,
    CourseStaffParticipantsFetchAction,
    courseStaffParticipantsFetchSucceededAction,
} from "./actions";
import { ParticipantDtoFull } from "../../api/types";
import {
    PARTICIPANTS_FETCH_REQUESTED_ACTION,
    COURSE_PARTICIPANTS_FETCH_REQUESTED_ACTION,
    COURSE_STAFF_PARTICIPANTS_FETCH_REQUESTED_ACTION,
} from "./constants";

export function* fetchParticipants(action: ParticipantsFetchAction) {
    try {
        const participants: ParticipantDtoFull[] = yield call(
            authenticatedFetchJSON,
            "GET",
            "participants",
            { participantIds: action.participantIds.join(",") },
        );

        yield put(participantsFetchSucceededAction(participants));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* fetchCourseParticipants(
    action: CourseParticipantsFetchAction,
) {
    try {
        const participants: ParticipantDtoFull[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.courseId}/participants`,
        );

        yield put(courseParticipantsFetchSucceededAction(participants));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* fetchCourseStaffParticipants(
    action: CourseStaffParticipantsFetchAction,
) {
    try {
        const staff: ParticipantDtoFull[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.courseId}/staff`,
        );

        yield put(courseStaffParticipantsFetchSucceededAction(staff));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* participantSagas() {
    yield takeEvery(PARTICIPANTS_FETCH_REQUESTED_ACTION, fetchParticipants);
    yield takeEvery(
        COURSE_PARTICIPANTS_FETCH_REQUESTED_ACTION,
        fetchCourseParticipants,
    );
    yield takeEvery(
        COURSE_STAFF_PARTICIPANTS_FETCH_REQUESTED_ACTION,
        fetchCourseStaffParticipants,
    );
}
