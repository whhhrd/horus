import {
    TokenSubmittedAction,
    canvasCoursesRequestedAction,
    canvasCoursesRequestSucceeededAction,
    importCanvasCourseFinishedAction,
    CanvasImportAction,
    CanvasRefreshSetsListRequestedAction,
    CanvasRefreshSetRequestedAction,
    CanvasGroupSetImportRequestedAction,
    CanvasRefreshParticipantsRequestedAction,
} from "./actions";

import { authenticatedFetchJSON } from "../../api";
import { put, takeEvery, call } from "redux-saga/effects";
import {
    TOKEN_SUBMITTED_ACTION,
    IMPORT_CANVAS_COURSE_REQUESTED_ACTION,
    CHECK_TOKEN_AND_REDIRECT_IMPORT_ACTION,
    CHECK_TOKEN_AND_REDIRECT_TOKEN_ACTION,
    CANVAS_COURSES_REQUESTED_ACTION,
    CANVAS_REFRESH_SETS_LIST_REQUESTED_ACTION,
    CANVAS_REFRESH_SET_REQUESTED_ACTION,
    CANVAS_IMPORT_GROUP_SET_REQUESTED_ACTION,
    CANVAS_REFRESH_PARTICIPANTS_REQUESTED_ACTION,
    CANVAS_REFRESH_COURSE_REQUESTED_ACTION,
} from "./constants";

import {
    notifyInfo,
    notifyError,
    notifySuccess,
} from "../notifications/constants";
import { push } from "connected-react-router";
import { PATH_CANVAS_IMPORT, PATH_CANVAS_TOKEN } from "../../routes";
import { BooleanResultDto, CanvasCourseDto } from "../../api/types";
import { jobAddAction } from "../jobs/action";
import { notificationDirectToTasks } from "../../components/pagebuilder";

export function* submitToken(action: TokenSubmittedAction) {
    try {
        yield call(authenticatedFetchJSON, "POST", "canvas", null, {
            token: action.token,
        });
    } catch (e) {
        yield put(notifyError(e.message));
    }
    yield put(push(PATH_CANVAS_IMPORT));
}

export function* importCourse(action: CanvasImportAction) {
    try {
        const result = yield call(
            authenticatedFetchJSON,
            "POST",
            `canvas/${action.courseId}`,
        );
        yield put(jobAddAction(result));
        yield put(notifyInfo(notificationDirectToTasks()));
    } catch (e) {
        yield put(notifyError(e.message));
    }
    yield put(importCanvasCourseFinishedAction(action.courseId));
}

export function* checkAndRedirectImport() {
    try {
        const result: BooleanResultDto = yield call(
            authenticatedFetchJSON,
            "GET",
            "canvas/tokenValid",
        );
        if (result.result) {
            yield put(push(PATH_CANVAS_IMPORT));
        }
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* retrieveCourses() {
    try {
        const result: CanvasCourseDto[] = yield call(
            authenticatedFetchJSON,
            "GET",
            "canvas",
        );
        yield put(canvasCoursesRequestSucceeededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* checkAndRedirectToken() {
    try {
        const result: BooleanResultDto = yield call(
            authenticatedFetchJSON,
            "GET",
            "canvas/tokenValid",
        );
        if (!result.result) {
            yield put(push(PATH_CANVAS_TOKEN));
        } else {
            yield put(canvasCoursesRequestedAction());
        }
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* refreshSetsList(action: CanvasRefreshSetsListRequestedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "PUT",
            `canvas/${action.courseId}/sets`,
        );
        yield put(notifySuccess("Succesfully retrieved group sets"));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* refreshSet(action: CanvasRefreshSetRequestedAction) {
    try {
        const result = yield call(
            authenticatedFetchJSON,
            "PUT",
            `canvas/${action.courseId}/sets/${action.groupSetId}`,
        );
        yield put(jobAddAction(result));
        yield put(notifyInfo(notificationDirectToTasks()));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* refreshParticipants(action: CanvasRefreshParticipantsRequestedAction) {
    try {
        yield put(
            notifyInfo(
                "Retrieving participant data. This will take a few seconds...",
            ),
        );

        yield call(
            authenticatedFetchJSON,
            "PUT",
            `canvas/${action.courseId}/participants`,
        );

        yield put(
            notifySuccess("Succesfully retrieved and updated participants data."),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* refreshCourse(action: CanvasRefreshParticipantsRequestedAction) {
    try {
        const result = yield call(
            authenticatedFetchJSON,
            "PUT",
            `canvas/${action.courseId}/all`,
        );
        yield put(jobAddAction(result));
        yield put(notifyInfo(notificationDirectToTasks()));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* importGroupSet(action: CanvasGroupSetImportRequestedAction) {
    try {
        const result = yield call(
            authenticatedFetchJSON,
            "POST",
            `canvas/${action.courseId}/sets`,
            null,
            action.formData,
            {},
            {},
            true,
        );
        yield put(jobAddAction(result));
        yield put(notifyInfo(notificationDirectToTasks()));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* canvasSaga() {
    yield takeEvery(TOKEN_SUBMITTED_ACTION, submitToken);
    yield takeEvery(IMPORT_CANVAS_COURSE_REQUESTED_ACTION, importCourse);
    yield takeEvery(
        CHECK_TOKEN_AND_REDIRECT_IMPORT_ACTION,
        checkAndRedirectImport,
    );
    yield takeEvery(
        CHECK_TOKEN_AND_REDIRECT_TOKEN_ACTION,
        checkAndRedirectToken,
    );
    yield takeEvery(CANVAS_COURSES_REQUESTED_ACTION, retrieveCourses);
    yield takeEvery(CANVAS_REFRESH_SETS_LIST_REQUESTED_ACTION, refreshSetsList);
    yield takeEvery(CANVAS_REFRESH_SET_REQUESTED_ACTION, refreshSet);
    yield takeEvery(CANVAS_IMPORT_GROUP_SET_REQUESTED_ACTION, importGroupSet);
    yield takeEvery(CANVAS_REFRESH_PARTICIPANTS_REQUESTED_ACTION, refreshParticipants);
    yield takeEvery(CANVAS_REFRESH_COURSE_REQUESTED_ACTION, refreshCourse);
}
