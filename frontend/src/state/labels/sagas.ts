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
    LabelCsvUploadAction,
} from "./action";
import { notifyError, notifyInfo } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import {
    LABEL_CREATE_ACTION,
    LABEL_UPDATE_ACTION,
    LABEL_DELETE_ACTION,
    LABEL_MAPPING_CREATE_ACTION,
    LABEL_MAPPING_DELETE_ACTION,
    LABEL_CSV_UPLOAD_ACTION,
} from "./constants";
import { authenticatedFetchJSON } from "../../api";
import { LabelDto, BatchJobDto } from "../../api/types";
import { jobAddAction } from "../jobs/action";
import { notificationDirectToTasks } from "../../components/pagebuilder";

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
        yield put(notifyError(e.message));
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
        yield put(notifyError(e.message));
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
        yield put(notifyError(e.message));
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
        yield put(notifyError(e.message));
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
        yield put(notifyError(e.message));
    }
}

export function* labelCsvUpload(action: LabelCsvUploadAction) {
    const {courseId, formData} = action;
    try {
        const result: BatchJobDto = yield call(
            authenticatedFetchJSON,
            "PATCH",
            `courses/${courseId}/labels`,
            null,
            formData,
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

export default function* labelsSaga() {
    yield takeEvery(LABEL_CREATE_ACTION, createLabel);
    yield takeEvery(LABEL_UPDATE_ACTION, updateLabel);
    yield takeEvery(LABEL_DELETE_ACTION, deleteLabel);
    yield takeEvery(LABEL_MAPPING_CREATE_ACTION, createLabelMapping);
    yield takeEvery(LABEL_MAPPING_DELETE_ACTION, deleteLabelMapping);
    yield takeEvery(LABEL_CSV_UPLOAD_ACTION, labelCsvUpload);
}
