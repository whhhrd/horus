import {SignOffDetails, SignOffState} from "./types";
import {
    SignOffHistoryRequestSucceededAction,
    SignOffResultsRequestSucceededAction,
    SignOffSaveSucceededction,
} from "./actions";
import {
    SIGN_OFF_HISTORY_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_HISTORY_REQUESTED_ACTION,
    SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import {
    AssignmentDtoBrief, AssignmentSetDtoFull, GroupDtoFull,
    ParticipantDtoBrief,
    SignOffResultDtoCompact,
    SignOffResultDtoSummary,
} from "../../api/types";
import {COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION} from "../comments/constants";
import {CommentDeleteSucceededAction} from "../comments/action";
import {EntityType} from "../comments/types";

const initialState: SignOffState = {
    signOffs: null,
    signOffHistory: null,
};

export default function signOffReducer(
    state: SignOffState,
    action:
        | SignOffResultsRequestSucceededAction
        | SignOffSaveSucceededction
        | SignOffHistoryRequestSucceededAction
        | CommentDeleteSucceededAction,
): SignOffState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION:
            const signOffResultRequestSucceededAction = action as SignOffResultsRequestSucceededAction;
            return {
                ...state,
                signOffs: {
                    signOffs: signOffResultRequestSucceededAction.signOffs,
                    group: signOffResultRequestSucceededAction.group,
                    assignmentSet:
                        signOffResultRequestSucceededAction.assignmentSet,
                },
            };
        case SIGN_OFF_RESULTS_REQUESTED_ACTION:
            return {
                ...state,
                signOffs: null,
            };
        case SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION:
            let signOffResults =
                state.signOffs != null ? [...state.signOffs.signOffs] : [];

            const successAction = action as SignOffSaveSucceededction;
            const deletions = successAction.deletions;
            signOffResults.forEach((current) => {
                successAction.signoffs.forEach((updated) => {
                    if (
                        current.assignmentId === updated.assignment.id &&
                        current.participantId === updated.participant.id
                    ) {
                        deletions.push(current.id);
                    }
                });
            });

            signOffResults = signOffResults.filter((s) => {
                return successAction.deletions.indexOf(s.id) < 0;
            });

            signOffResults = signOffResults.concat(
                convertToCompact(successAction.signoffs),
            );

            return {
                ...state,
                signOffs: {
                    ...state.signOffs!,
                    signOffs: signOffResults,
                },
            };
        case SIGN_OFF_HISTORY_REQUESTED_ACTION:
            return {
                ...state,
                signOffHistory: null,
            };
        case SIGN_OFF_HISTORY_REQUEST_SUCCEEDED_ACTION:
            const history = (action as SignOffHistoryRequestSucceededAction)
                .signOffHistory;
            return {
                ...state,
                signOffHistory: history,
            };
        case COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION: {
            return {
                ...state,
                signOffs: commentDeleteReducer(state.signOffs, action as CommentDeleteSucceededAction),
            };
        }
        default:
            return state;
    }
}

function convertToCompact(signOffs: SignOffResultDtoSummary[]) {
    const result: SignOffResultDtoCompact[] = [];

    signOffs.forEach((s) => {
        const compact: SignOffResultDtoCompact = {
            assignmentId: s.assignment.id,
            commentThreadId:
                s.commentThread != null ? s.commentThread.id : null,
            id: s.id,
            participantId: s.participant.id,
            result: s.result,
        };
        result.push(compact);
    });
    return result;
}

function commentDeleteReducer(state: SignOffDetails | null, action: CommentDeleteSucceededAction) {
    if (state == null) {
        return null;
    }

    const commentThreadId = action.commentThread == null ? null : action.commentThread.id;
    const entityId = action.entityId;
    switch (action.entityType) {
        case EntityType.Signoff:
            const newSignOffs: SignOffResultDtoCompact[] = [];
            state.signOffs.forEach((signOff) => {
                if (signOff.id === entityId) {
                    newSignOffs.push({
                        ...signOff,
                        commentThreadId,
                    });
                } else {
                    newSignOffs.push(signOff);
                }
            });
            return {...state, signOffs: newSignOffs};
        case EntityType.Participant:
            const newParticipants: ParticipantDtoBrief[] = [];
            state.group.participants.forEach((participant) => {
                if (participant.id === entityId) {
                    newParticipants.push({
                        ...participant,
                        commentThread: action.commentThread,
                    });
                } else {
                    newParticipants.push(participant);
                }
            });
            const newGroup: GroupDtoFull = {
                ...state.group,
                participants: newParticipants,
            };
            return {...state, group: newGroup};
        case EntityType.Group:
            if (state.group.id === entityId) {
                const updatedGroup: GroupDtoFull = {
                    ...state.group,
                    commentThread: action.commentThread,
                };
                return {...state, group: updatedGroup};
            } else {
                return state;
            }
        case EntityType.Assignment:
            const newAssignments: AssignmentDtoBrief[] = [];
            state.assignmentSet.assignments.forEach((assignment) => {
                if (assignment.id === entityId) {
                    newAssignments.push({
                        ...assignment,
                        commentThreadId,
                    });
                } else {
                    newAssignments.push(assignment);
                }
            });
            const newAssignmentSet: AssignmentSetDtoFull = {
                ...state.assignmentSet,
                assignments: newAssignments,
            };
            return {...state, assignmentSet: newAssignmentSet};
        default:
            return state;
    }
}
