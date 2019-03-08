import {
    COMMENT_THREADS_REQUEST_SUCCEEDED_ACTION,
    COMMENT_CREATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_UPDATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_THREAD_CREATE_REQUEST_SUCCEEDED_ACTION,
    COMMENT_THREAD_REQUEST_SUCCEEDED_ACTION,
    COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import { CommentsState } from "./types";
import { CommentThreadDtoFull, CommentDto } from "../types";
import {
    CommentThreadsRequestSucceededAction,
    CommentCreateSucceededAction,
    CommentThreadCreateSucceededAction,
    CommentUpdateSucceededAction,
    CommentThreadRequestSucceededAction,
    CommentDeleteSucceededAction,
} from "./action";

const initialState: CommentsState = {
    commentThreads: null,
};

export default function commentsReducer(
    state: CommentsState,
    action: CommentThreadsRequestSucceededAction |
        CommentThreadsRequestSucceededAction |
        CommentThreadRequestSucceededAction |
        CommentUpdateSucceededAction |
        CommentCreateSucceededAction |
        CommentDeleteSucceededAction): CommentsState {

    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case COMMENT_THREADS_REQUEST_SUCCEEDED_ACTION:
            return { ...state, commentThreads: (action as CommentThreadsRequestSucceededAction).commentThreads };
        case COMMENT_THREAD_REQUEST_SUCCEEDED_ACTION:
            const commentThread = (action as CommentThreadRequestSucceededAction).commentThread;
            return updateCommentsStateWithThread(state, commentThread);
        case COMMENT_CREATE_REQUEST_SUCCEEDED_ACTION:
            const createdComment = (action as CommentCreateSucceededAction).comment;
            return updateCommentsStateWithComment(state, createdComment);
        case COMMENT_UPDATE_REQUEST_SUCCEEDED_ACTION:
            const updatedComment = (action as CommentUpdateSucceededAction).comment;
            return updateCommentsStateWithComment(state, updatedComment);
        case COMMENT_THREAD_CREATE_REQUEST_SUCCEEDED_ACTION:
            const createdCommentThread = (action as CommentThreadCreateSucceededAction).commentThread;
            return updateCommentsStateWithThread(state, createdCommentThread);
        case COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION:
            const commentId = (action as CommentDeleteSucceededAction).comment;
            return updateCommentsStateWithCommentDelete(state, commentId);
        default:
            return state;
    }
}

function updateCommentsStateWithComment(state: CommentsState, comment: CommentDto) {
    const newState = {
        ...state,
        commentThreads: state.commentThreads !== null ? state.commentThreads.slice() : null,
    };

    if (newState.commentThreads != null) {

        // First check if commentThread exist in state
        const commentThread = newState.commentThreads.find((t) => (t.id === comment.thread.id));
        if (commentThread !== undefined) {

            const threadIndex = newState.commentThreads.indexOf(commentThread);

            const newComments = commentThread.comments.slice();

            // Check if the comment with this ID is already there (in case we are editing a comment)
            const tempComment = newComments.find((cmnt) => cmnt.id === comment.id);

            // If it exists, replace it
            if (tempComment !== undefined) {
                const index = newComments.indexOf(tempComment);
                newComments[index] = comment;
            } else {
                newComments.push(comment);
            }

            commentThread.comments = newComments;
            newState.commentThreads[threadIndex] = commentThread;
        } else {
            return newState;
        }
    }
    return newState;
}

function updateCommentsStateWithThread(state: CommentsState, commentThread: CommentThreadDtoFull) {
    const newState = {
        ...state,
        commentThreads: state.commentThreads !== null ? state.commentThreads.slice() : null,
    };

    if (newState.commentThreads !== null) {
        const newCommentThreads = newState.commentThreads;

        const tempCommentThread = newCommentThreads.find((t) => t.id === commentThread.id);

        if (tempCommentThread !== undefined) {
            const index = newCommentThreads.indexOf(tempCommentThread);
            newCommentThreads[index] = commentThread;
        } else {
            newCommentThreads.push(commentThread);
        }
        newState.commentThreads = newCommentThreads;
    } else {
        const newCommentThreads: CommentThreadDtoFull[] = [];
        newCommentThreads.push(commentThread);
        newState.commentThreads = newCommentThreads;
    }

    return newState;
}

function updateCommentsStateWithCommentDelete(state: CommentsState, comment: CommentDto) {
    const newState = {
        ...state,
        commentThreads: state.commentThreads !== null ? state.commentThreads.slice() : null,
    };

    if (newState.commentThreads !== null) {
        const newCommentThreads = newState.commentThreads;
        const thread = newCommentThreads.find((t) => t.id === comment.thread.id);
        const threadIndex = newCommentThreads.indexOf(thread!);

        const oldComment = thread!.comments.find((c) => c.id === comment.id);
        const oldCommentIndex = thread!.comments.indexOf(oldComment!);

        thread!.comments.splice(oldCommentIndex, 1);

        if (thread!.comments.length !== 0) {
            newState.commentThreads = newCommentThreads;
        } else {
            newState.commentThreads.splice(threadIndex, 1);
        }
    }

    return newState;
}
