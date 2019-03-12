import { ApplicationState } from "../state";
import { EntityType } from "./types";

export const getCommentThreads = (
    state: ApplicationState,
    entityType: EntityType,
) => {
    if (state.comments != null) {
        switch (entityType) {
            case EntityType.Participant:
                return state.comments.participantThreads;
            case EntityType.Group:
                return state.comments.groupThreads;
            case EntityType.Assignment:
                return state.comments.assignmentThreads;
            case EntityType.Signoff:
                return state.comments.signoffThreads;
            default:
                return null;
        }
    } else {
        return null;
    }
};

export const getCommentThread = (state: ApplicationState, entityId: number, entityType: EntityType) => {
    const commentThreads = getCommentThreads(state, entityType);
    const commentThread = commentThreads != null ? commentThreads.get(entityId) : null;
    return commentThread != null ? commentThread : null;
};
