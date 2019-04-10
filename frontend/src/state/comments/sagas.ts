import { put, takeEvery, call } from "redux-saga/effects";

import {
    COMMENT_CREATE_REQUESTED_ACTION,
    COMMENT_UPDATE_REQUESTED_ACTION,
    COMMENT_THREAD_CREATE_REQUESTED_ACTION,
    COMMENT_THREAD_REQUESTED_ACTION,
    COMMENT_DELETE_REQUESTED_ACTION,
} from "./constants";
import { notifyError } from "../notifications/constants";

import { authenticatedFetchJSON } from "../../api";
import { CommentThreadDtoFull } from "../../api/types";
import { EntityType } from "./types";

import {
    commentCreateRequestSucceededAction,
    CommentCreateRequestAction,
    CommentUpdateRequestAction,
    CommentThreadCreateAction,
    commentThreadCreateRequestSucceededAction,
    CommentThreadRequestedAction,
    commentThreadRequestSucceededAction,
    CommentDeleteRequestAction,
    commentDeleteRequestSucceededAction,
    commentUpdateRequestSucceededAction,
} from "./action";

function getEntityTypePrefix(entityType: EntityType) {
    switch (entityType) {
        case EntityType.Assignment:
            return "assignments";
        case EntityType.Group:
            return "groups";
        case EntityType.Participant:
            return "participants";
        case EntityType.Signoff:
            return "signoff";
    }
}

export function* requestCommentThread(action: CommentThreadRequestedAction) {
    try {
        const { entityId, entityType } = action;
        const urlPrefix = getEntityTypePrefix(entityType);
        const result: CommentThreadDtoFull = yield call(
            authenticatedFetchJSON,
            "GET",
            `${urlPrefix}/${entityId}/comments`,
        );
        yield put(
            commentThreadRequestSucceededAction(
                entityId,
                entityType,
                result,
            ),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* createCommentThread(action: CommentThreadCreateAction) {
    try {
        const { entityId, entityType, commentThreadCreate } = action;

        const urlPrefix = getEntityTypePrefix(entityType);

        const result: CommentThreadDtoFull = yield call(
            authenticatedFetchJSON,
            "POST",
            `${urlPrefix}/${entityId}/comments`,
            null,
            commentThreadCreate,
        );

        yield put(
            commentThreadCreateRequestSucceededAction(
                entityId,
                entityType,
                result,
            ),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* createComment(action: CommentCreateRequestAction) {
    try {
        const { entityId, entityType } = action;
        const result: CommentThreadDtoFull = yield call(
            authenticatedFetchJSON,
            "POST",
            `comments`,
            null,
            action.commentCreate,
        );
        yield put(
            commentCreateRequestSucceededAction(entityId, entityType, result),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* deleteComment(action: CommentDeleteRequestAction) {
    try {
        const { entityId, entityType, comment } = action;
        const result: CommentThreadDtoFull = yield call(
            authenticatedFetchJSON,
            "DELETE",
            `comments/${comment.id}`,
        );
        yield put(
            commentDeleteRequestSucceededAction(entityId, entityType, result),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* updateComment(action: CommentUpdateRequestAction) {
    try {
        const { entityId, entityType, commentUpdate, commentId } = action;
        const result: CommentThreadDtoFull = yield call(
            authenticatedFetchJSON,
            "PUT",
            `comments/${commentId}`,
            null,
            commentUpdate,
        );
        yield put(
            commentUpdateRequestSucceededAction(entityId, entityType, result),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* commentsSagas() {
    yield takeEvery(COMMENT_THREAD_REQUESTED_ACTION, requestCommentThread);
    yield takeEvery(COMMENT_CREATE_REQUESTED_ACTION, createComment);
    yield takeEvery(COMMENT_UPDATE_REQUESTED_ACTION, updateComment);
    yield takeEvery(
        COMMENT_THREAD_CREATE_REQUESTED_ACTION,
        createCommentThread,
    );
    yield takeEvery(COMMENT_DELETE_REQUESTED_ACTION, deleteComment);
}
