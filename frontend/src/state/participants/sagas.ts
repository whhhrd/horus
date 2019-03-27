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
        // Fetch participants using the API
        const participants: ParticipantDtoFull[] = yield call(
            authenticatedFetchJSON,
            "GET",
            "participants",
            { participantIds: action.participantIds.join(",") },
        );

        // If successful, update the state
        yield put(participantsFetchSucceededAction(participants));
    } catch (e) {
        // Something went wrong, send an error
        yield put(notifyError("Failed to fetch participants"));
    }
}

export function* fetchCourseParticipants(
    action: CourseParticipantsFetchAction,
) {
    try {
        // Fetch participants using the API
        const participants: ParticipantDtoFull[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.courseId}/participants`,
        );

        // If successful, update the state
        yield put(courseParticipantsFetchSucceededAction(participants));
    } catch (e) {
        // Something went wrong, send an error
        yield put(notifyError("Failed to fetch course participants"));
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
        yield put(notifyError("Failed to fetch course staff participants"));
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
