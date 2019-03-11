import { CommentThreadDtoFull } from "../../api/types";

export interface CommentsState {
    commentThreads: CommentThreadDtoFull[] | null;
}
