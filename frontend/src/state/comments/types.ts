import { CommentThreadDtoFull } from "../../api/types";

export interface CommentsState {
    participantThreads: Map<number, CommentThreadDtoFull | null> | null;
    groupThreads: Map<number, CommentThreadDtoFull | null> | null;
    assignmentThreads: Map<number, CommentThreadDtoFull | null> | null;
    signoffThreads: Map<number, CommentThreadDtoFull | null> | null;
}

export enum EntityType {
    Participant,
    Group,
    Assignment,
    Signoff,
}
