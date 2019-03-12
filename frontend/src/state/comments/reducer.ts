import {
    COMMENT_CREATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_UPDATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_THREAD_CREATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_THREAD_REQUEST_SUCCEEDED_ACTION,
    COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_THREAD_REQUESTED_ACTION,
} from "./constants";
import { CommentsState, EntityType } from "./types";
import { CommentThreadDtoFull } from "../../api/types";
import {
    CommentCreateSucceededAction,
    CommentThreadCreateSucceededAction,
    CommentUpdateSucceededAction,
    CommentThreadRequestSucceededAction,
    CommentDeleteSucceededAction,
    CommentThreadRequestedAction,
} from "./action";
import { Action } from "redux";

const initialState: CommentsState = {
    participantThreads: null,
    groupThreads: null,
    signoffThreads: null,
    assignmentThreads: null,
};

export default function commentsReducer(
    state: CommentsState,
    action: Action,
): CommentsState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case COMMENT_THREAD_REQUEST_SUCCEEDED_ACTION: {
            const {
                entityId,
                entityType,
                commentThread,
            } = action as CommentThreadRequestSucceededAction;
            return setCommentThread(state, entityId, entityType, commentThread);
        }

        case COMMENT_CREATE_REQUEST_SUCCEEDED_ACTION: {
            const {
                entityId,
                entityType,
                commentThread,
            } = action as CommentCreateSucceededAction;
            return setCommentThread(state, entityId, entityType, commentThread);
        }

        case COMMENT_UPDATE_REQUEST_SUCCEEDED_ACTION: {
            const {
                entityId,
                entityType,
                commentThread,
            } = action as CommentUpdateSucceededAction;
            return setCommentThread(state, entityId, entityType, commentThread);
        }

        case COMMENT_THREAD_CREATE_REQUEST_SUCCEEDED_ACTION: {
            const {
                entityId,
                entityType,
                commentThread,
            } = action as CommentThreadCreateSucceededAction;
            return setCommentThread(state, entityId, entityType, commentThread);
        }

        case COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION: {
            const {
                entityId,
                entityType,
                commentThread,
            } = action as CommentDeleteSucceededAction;
            return setCommentThread(state, entityId, entityType, commentThread);
        }

        case COMMENT_THREAD_REQUESTED_ACTION: {
            const {
                entityId,
                entityType,
            } = action as CommentThreadRequestedAction;
            return setCommentThread(state, entityId, entityType, null);
        }

        default:
            return state;
    }
}

function setCommentThread(
    state: CommentsState,
    entityId: number,
    entityType: EntityType,
    commentThread: CommentThreadDtoFull | null,
) {
    const newState = {
        ...state,
    };

    switch (entityType) {
        case EntityType.Participant:

            if (newState.participantThreads == null) {
                newState.participantThreads = new Map<
                    number,
                    CommentThreadDtoFull
                >();
            }
            newState.participantThreads.set(entityId, commentThread);
            return newState;
        case EntityType.Group:
            if (newState.groupThreads == null) {
                newState.groupThreads = new Map<number, CommentThreadDtoFull>();
            }
            newState.groupThreads.set(entityId, commentThread);
            return newState;
        case EntityType.Assignment:
            if (newState.assignmentThreads == null) {
                newState.assignmentThreads = new Map<
                    number,
                    CommentThreadDtoFull
                >();
            }
            newState.assignmentThreads.set(entityId, commentThread);
            return newState;
        case EntityType.Signoff:
            if (newState.signoffThreads == null) {
                newState.signoffThreads = new Map<
                    number,
                    CommentThreadDtoFull
                >();
            }
            newState.signoffThreads.set(entityId, commentThread);
            return newState;
        default:
            return newState;
    }
}
