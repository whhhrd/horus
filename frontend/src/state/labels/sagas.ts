import {
    LabelCreateAction,
    labelCreateSucceededAction,
    LabelUpdateAction,
    labelUpdateSucceededAction,
    LabelDeleteAction,
    labelDeleteSucceededAction,
    LabelMappingCreateAction,
    LabelMappingDeleteAction,
    labelMappingCreateSucceededAction,
    labelMappingDeleteSucceededAction,
} from "./action";
import { notifyError } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import {
    LABEL_CREATE_ACTION,
    LABEL_UPDATE_ACTION,
    LABEL_DELETE_ACTION,
    LABEL_MAPPING_CREATE_ACTION,
    LABEL_MAPPING_DELETE_ACTION,
} from "./constants";
import { authenticatedFetchJSON } from "../../api";
import { LabelDto } from "../../api/types";

export function* createLabel(action: LabelCreateAction) {
    try {
        const label: LabelDto = yield call(
            authenticatedFetchJSON,
            "POST",
            `courses/${action.courseId}/labels`,
            null,
            action.labelCreate,
        );
        yield put(labelCreateSucceededAction(label));
    } catch (e) {
        yield put(
            notifyError(
                "Failed to create label. Label name can only contain (at most 15) alphanumeric characters and hyphens.",
            ),
        );
    }
}

export function* updateLabel(action: LabelUpdateAction) {
    try {
        const label: LabelDto = yield call(
            authenticatedFetchJSON,
            "PUT",
            `courses/${action.courseId}/labels/${action.labelId}`,
            null,
            action.labelUpdate,
        );
        yield put(labelUpdateSucceededAction(label));
    } catch (e) {
        yield put(
            notifyError(
                "Failed to update label. Label name can only contain (at most 15) alphanumeric characters and hyphens.",
            ),
        );
    }
}

export function* deleteLabel(action: LabelDeleteAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `courses/${action.courseId}/labels/${action.labelId}`,
        );
        yield put(labelDeleteSucceededAction(action.labelId));
    } catch (e) {
        yield put(notifyError("Failed to delete label."));
    }
}

export function* createLabelMapping(action: LabelMappingCreateAction) {
    const {participantId, label} = action;
    try {
        yield call(
            authenticatedFetchJSON,
            "POST",
            `participants/${participantId}/labels/${label.id}`,
        );
        yield put(
            labelMappingCreateSucceededAction(
                participantId,
                label,
            ),
        );
    } catch (e) {
        yield put(notifyError("Failed to map label to student"));
    }
}

export function* deleteLabelMapping(action: LabelMappingDeleteAction) {
    const {participantId, label} = action;
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `participants/${participantId}/labels/${label.id}`,
        );
        yield put(
            labelMappingDeleteSucceededAction(
                participantId,
                label,
            ),
        );
    } catch (e) {
        yield put(notifyError("Failed to delete mapped label to student"));
    }
}

export default function* labelsSaga() {
    yield takeEvery(LABEL_CREATE_ACTION, createLabel);
    yield takeEvery(LABEL_UPDATE_ACTION, updateLabel);
    yield takeEvery(LABEL_DELETE_ACTION, deleteLabel);
    yield takeEvery(LABEL_MAPPING_CREATE_ACTION, createLabelMapping);
    yield takeEvery(LABEL_MAPPING_DELETE_ACTION, deleteLabelMapping);
}
