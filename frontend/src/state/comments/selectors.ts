import { ApplicationState } from "../state";
export const getCommentThreads = (state: ApplicationState) =>
    state.comments !== undefined ? state.comments!.commentThreads : undefined;

export const getCommentThread = (state: ApplicationState, id: number) => {
    const commentThreads = getCommentThreads(state);
    return commentThreads !== undefined ? commentThreads.find((t) => t.id === id) : undefined;
};
