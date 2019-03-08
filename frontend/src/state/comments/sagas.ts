import {
    commentCreateRequestSucceededAction,
    CommentCreateRequestAction,
    CommentUpdateRequestAction,
    CommentThreadCreateAction,
    commentThreadCreateRequestSucceededAction,
    CommentThreadsRequestedAction,
    commentThreadsRequestSucceededAction,
    CommentThreadRequestedAction,
    commentThreadRequestSucceededAction,
    CommentDeleteRequestAction,
    commentDeleteRequestSucceededAction,
} from "./action";

import { notifyError, notifySuccess } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";

import {
    COMMENT_CREATE_REQUESTED_ACTION,
    COMMENT_UPDATE_REQUESTED_ACTION,
    COMMENT_THREAD_CREATE_REQUESTED_ACTION,
    COMMENT_THREADS_REQUESTED_ACTION,
    COMMENT_THREAD_REQUESTED_ACTION,
    COMMENT_DELETE_REQUESTED_ACTION,
} from "./constants";

import { authenticatedFetchJSON } from "../../api";
import { CommentThreadDtoFull, CommentDto } from "../types";
import { CommentThreadType } from "../../components/comments/CommentThread";

export function* requestCommentThreads(action: CommentThreadsRequestedAction) {
    try {
        const threadIds = action.ctids;
        const commentThreads: CommentThreadDtoFull[] =
            yield call(authenticatedFetchJSON, "GET", `threads`, { threadIds });
        yield put(commentThreadsRequestSucceededAction(commentThreads));
    } catch (e) {
        yield put(notifyError("Could not fetch comment thread"));
    }
}

export function* requestCommentThread(action: CommentThreadRequestedAction) {
    try {
        const commentThreads: CommentThreadDtoFull[] =
            yield call(authenticatedFetchJSON, "GET", `threads?threadIds=${action.ctid}`);
        yield put(commentThreadRequestSucceededAction(commentThreads[0]));
    } catch (e) {
        yield put(notifyError("Could not fetch comment thread"));
    }
}

export function* createCommentThread(action: CommentThreadCreateAction) {
    try {
        const { linkedEntityId, linkedEntityType, commentThreadCreate } = action;

        let urlPrefix = "";

        switch (linkedEntityType) {
            case CommentThreadType.Assignment:
                urlPrefix = "assignments";
                break;
            case CommentThreadType.Group:
                urlPrefix = "groups";
                break;
            case CommentThreadType.Participant:
                urlPrefix = "participants";
                break;
            case CommentThreadType.Signoff:
                urlPrefix = "signoff"; // TODO adapt to API call (Rick)
                break;
            default:
                break;
        }

        const result = yield call(authenticatedFetchJSON, "POST",
            `${urlPrefix}/${linkedEntityId}/comments`, null, commentThreadCreate);

        yield put(commentThreadCreateRequestSucceededAction(result));
        yield put(notifySuccess("Succesfully created comment thread"));
    } catch (e) {
        yield put(notifyError("Could not create comment thread"));
    }
}

export function* createComment(action: CommentCreateRequestAction) {
    try {
        const result: CommentDto = yield call(authenticatedFetchJSON, "POST",
            `comments`, null, action.commentCreate);
        yield put(commentCreateRequestSucceededAction(result));
        yield put(notifySuccess("Comment created"));
    } catch (e) {
        yield put(notifyError("Could not create comment"));
    }
}

export function* deleteComment(action: CommentDeleteRequestAction) {
    try {
        yield call(authenticatedFetchJSON, "DELETE",
            `comments/${action.comment.id}`);
        yield put(commentDeleteRequestSucceededAction(action.comment));
        yield put(notifySuccess("Comment deleted"));
    } catch (e) {
        yield put(notifyError("Could not delete comment"));
    }
}

export function* updateComment(action: CommentUpdateRequestAction) {
    try {
        const result: CommentDto = yield call(authenticatedFetchJSON, "PUT",
            `comments/${action.commentId}`, null, action.commentUpdate);
        yield put(commentCreateRequestSucceededAction(result));
        yield put(notifySuccess("Comment updated"));
    } catch (e) {
        yield put(notifyError("Could not edit comment"));
    }
}

export default function* commentsSagas() {
    yield takeEvery(COMMENT_THREADS_REQUESTED_ACTION, requestCommentThreads);
    yield takeEvery(COMMENT_THREAD_REQUESTED_ACTION, requestCommentThread);
    yield takeEvery(COMMENT_CREATE_REQUESTED_ACTION, createComment);
    yield takeEvery(COMMENT_UPDATE_REQUESTED_ACTION, updateComment);
    yield takeEvery(COMMENT_THREAD_CREATE_REQUESTED_ACTION, createCommentThread);
    yield takeEvery(COMMENT_DELETE_REQUESTED_ACTION, deleteComment);
}
