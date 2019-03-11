import { ApplicationState } from "../state";
export const getCommentThreads = (state: ApplicationState) =>
    state.comments != null ? state.comments!.commentThreads : null;

export const getCommentThread = (state: ApplicationState, id: number) => {
    const commentThreads = getCommentThreads(state);
    const commentThread = commentThreads != null ? commentThreads.find((t) => t.id === Number(id)) : null;
    return commentThread != null ? commentThread : null;
    // Ask me for the logic if you don't get what's happening in this getter
};
