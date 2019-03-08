import { ApplicationState } from "../state";
export const getCommentThreads = (state: ApplicationState) =>
    state.comments !== undefined ? state.comments!.commentThreads : null;

export const getCommentThread = (state: ApplicationState, id: number) => {
    const commentThreads = getCommentThreads(state);
    const commentThread = commentThreads != null ? commentThreads.find((t) => t.id === Number(id)) : undefined;
    return commentThread !== undefined ? commentThread : null;
    // Ask me for the logic if you don't get what's happening in this getter
};
