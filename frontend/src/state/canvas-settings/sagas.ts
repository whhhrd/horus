import {
    TokenSubmittedAction,
    canvasCoursesRequestedAction,
    canvasCoursesRequestSucceeededAction,
    importCanvasCourseFinishedAction,
    CanvasImportAction,
    CanvasRefreshSetsListRequestedAction,
    CanvasRefreshSetRequestedAction,
    canvasRefreshSetsListRequestSucceededAction,
    canvasRefreshSetRequestSucceededAction,
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
} from "./constants";

import { notifyInfo, notifyError, notifySuccess } from "../notifications/constants";
import { push } from "connected-react-router";
import { PATH_CANVAS_IMPORT, PATH_CANVAS_TOKEN } from "../../routes";
import { BooleanResultDto, CanvasCourseDto } from "../../api/types";

export function* submitToken(action: TokenSubmittedAction) {
    try {
        yield call(authenticatedFetchJSON, "POST", "canvas", null, { token: action.token });
        yield put(push(PATH_CANVAS_IMPORT));
    } catch (e) {
        yield put(notifyError("Token submit failed"));
    }
}

export function* importCourse(action: CanvasImportAction) {
    try {
        yield put(notifyInfo("Course import started..."));
        yield call(authenticatedFetchJSON, "POST", `canvas/${action.courseId}`);
        yield put(notifySuccess("Canvas course import succeeded!", false));
    } catch (e) {
        yield put(notifyError("Canvas import failed", false));
    }
    yield put(importCanvasCourseFinishedAction(action.courseId));

}

export function* checkAndRedirectImport() {
    try {
        const result: BooleanResultDto = yield call(authenticatedFetchJSON, "GET", "canvas/tokenValid");
        if (result.result) {
            yield put(push(PATH_CANVAS_IMPORT));
        }
    } catch (e) {
        yield put(notifyError("Could not check token"));
    }
}

export function* retrieveCourses() {
    try {
        const result: CanvasCourseDto[] = yield call(authenticatedFetchJSON, "GET", "canvas");
        yield put(canvasCoursesRequestSucceeededAction(result));
    } catch (e) {
        yield put(notifyError("Failed to retrieve courses from Canvas"));
    }
}

export function* checkAndRedirectToken() {
    try {
        const result: BooleanResultDto = yield call(authenticatedFetchJSON, "GET", "canvas/tokenValid");
        if (!result.result) {
            yield put(push(PATH_CANVAS_TOKEN));
        } else {
            yield put(canvasCoursesRequestedAction());
        }
    } catch (e) {
        yield put(notifyError("Could not check token"));
    }
}

export function* refreshSetsList(action: CanvasRefreshSetsListRequestedAction) {
    try {
        const result = yield call(authenticatedFetchJSON, "PUT", `canvas/${action.courseId}/sets`);
        yield put(canvasRefreshSetsListRequestSucceededAction(result));
        yield put(notifySuccess("Succesfully synchronized Canvas group sets"));
        // TODO update state
    } catch (e) {
        yield put(notifyError("Failed to synchronized Canvas group sets"));
    }
}

export function* refreshSet(action: CanvasRefreshSetRequestedAction) {
    try {
        const result = yield call(authenticatedFetchJSON, "PUT", `canvas/${action.courseId}/sets/${action.groupSetId}`);
        yield put(canvasRefreshSetRequestSucceededAction(result));
        yield put(notifySuccess("Succesfully synchronized Canvas group"));
        // TODO update state
    } catch (e) {
        yield put(notifyError("Failed to synchronized Canvas group"));
    }
}

export default function* canvasSaga() {
    yield takeEvery(TOKEN_SUBMITTED_ACTION, submitToken);
    yield takeEvery(IMPORT_CANVAS_COURSE_REQUESTED_ACTION, importCourse);
    yield takeEvery(CHECK_TOKEN_AND_REDIRECT_IMPORT_ACTION, checkAndRedirectImport);
    yield takeEvery(CHECK_TOKEN_AND_REDIRECT_TOKEN_ACTION, checkAndRedirectToken);
    yield takeEvery(CANVAS_COURSES_REQUESTED_ACTION, retrieveCourses);
    yield takeEvery(CANVAS_REFRESH_SETS_LIST_REQUESTED_ACTION, refreshSetsList);
    yield takeEvery(CANVAS_REFRESH_SET_REQUESTED_ACTION, refreshSet);
}
