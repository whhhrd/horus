import {combineReducers} from "redux";

import {
    SignOffOverviewAction,
    SignOffOverviewFetchRequestedAction,
    SignOffOverviewGroupsFetchPageSucceededAction,
    SignOffOverviewResultsFetchSucceededAction,
    SignOffOverviewState,
    SignOffResultsMap,
    SignOffOverviewGroupsPageProgress,
} from "./types";
import {GroupDtoFull, ParticipantDtoBrief, SignOffResultDtoCompact} from "../../api/types";
import {
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION,
} from "./constants";
import { SignOffOverviewFilterSucceededAction } from "./actions";
import {CommentDeleteSucceededAction} from "../comments/action";
import {COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION} from "../comments/constants";
import {EntityType} from "../comments/types";

export const initialState: SignOffOverviewState = {
    groups: [],
    signOffResults: new Map(),
    loading: false,
    progress: {
        total: 1,
        loaded: 0,
    },
};

function groupsReducer(
    state: GroupDtoFull[] = initialState.groups,
    action:
        | SignOffOverviewFetchRequestedAction
        | SignOffOverviewGroupsFetchPageSucceededAction
        | CommentDeleteSucceededAction
        | SignOffOverviewFilterSucceededAction,
): GroupDtoFull[] {
    switch (action.type) {
        case SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION:
            return initialState.groups;
        case SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION:
            const groups = (action as SignOffOverviewGroupsFetchPageSucceededAction)
                .groups;
            return [...state, ...groups];
        case COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION:
            const commentDelAction = action as CommentDeleteSucceededAction;
            const entityId = commentDelAction.entityId;
            switch (commentDelAction.entityType) {
                case EntityType.Participant:
                    const newGroups: GroupDtoFull[] = [];
                    state.forEach((group) => {
                        const newParticipants: ParticipantDtoBrief[] = [];
                        group.participants.forEach((participant) => {
                            if (participant.id === entityId) {
                                newParticipants.push({
                                    ...participant,
                                    commentThread: commentDelAction.commentThread,
                                });
                            } else {
                                newParticipants.push(participant);
                            }
                        });
                        const newGroup: GroupDtoFull = {
                            ...group,
                            participants: newParticipants,
                        };
                        newGroups.push(newGroup);
                    });
                    return newGroups;
                case EntityType.Group:
                    const updatedGroups: GroupDtoFull[] = [];
                    state.forEach((group) => {
                        if (group.id === entityId) {
                            updatedGroups.push({
                                ...group,
                                commentThread: commentDelAction.commentThread,
                            });
                        } else {
                            updatedGroups.push(group);
                        }
                    });
                    return updatedGroups;
                default:
                    return state;
            }
        case SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION:
            return initialState.groups;
        case SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION:
            const filteredGroups = (action as SignOffOverviewFilterSucceededAction)
                .groups;
            return [...state, ...filteredGroups];
        default:
            return state;
    }
}

function resultsReducer(
    state: SignOffResultsMap = initialState.signOffResults,
    action:
        | SignOffOverviewResultsFetchSucceededAction
        | CommentDeleteSucceededAction,
): SignOffResultsMap {
    switch (action.type) {
        case SIGN_OFF_OVERVIEW_RESULTS_FETCH_SUCCEEDED_ACTION:
            const overviewFetchAction = action as SignOffOverviewResultsFetchSucceededAction;
            const map: SignOffResultsMap = new Map();
            overviewFetchAction.results.forEach((result) => {
                if (map.get(result.participantId) == null) {
                    map.set(result.participantId, new Map());
                }
                if (
                    map.get(result.participantId)!.get(result.assignmentId) ==
                    null
                ) {
                    map.get(result.participantId)!.get(result.assignmentId);
                }
                map.get(result.participantId)!.set(result.assignmentId, result);
            });
            return map;
        case COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION:
            const commentDelAction = action as CommentDeleteSucceededAction;
            switch (commentDelAction.entityType) {
                case EntityType.Signoff:
                    const commentThreadId = commentDelAction.commentThread == null
                        ? null : commentDelAction.commentThread.id;
                    const entityId = commentDelAction.entityId;
                    const newSignOffResultsMap: SignOffResultsMap = new Map();
                    state.forEach((assignmentMap: Map<number, SignOffResultDtoCompact>, participantId: number) => {
                        const newAssignmentMap: Map<number, SignOffResultDtoCompact> = new Map();
                        assignmentMap.forEach((signOffResult: SignOffResultDtoCompact, assignmentId: number) => {
                            if (signOffResult.id === entityId) {
                                const newSignOffResult = {...signOffResult, commentThreadId};
                                newAssignmentMap.set(assignmentId, newSignOffResult);
                            } else {
                                newAssignmentMap.set(assignmentId, signOffResult);
                            }
                        });
                        newSignOffResultsMap.set(participantId, newAssignmentMap);
                    });
                    return newSignOffResultsMap;
                default:
                    return state;
            }
        default:
            return state;
    }
}

function loadingReducer(
    state: boolean = initialState.loading,
    action: SignOffOverviewAction,
): boolean {
    switch (action.type) {
        case SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION:
        case SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION:
            return true;
        case SIGN_OFF_OVERVIEW_GROUPS_FETCH_SUCCEEDED_ACTION:
            return false;
        case SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION:
            const finished = (action as SignOffOverviewFilterSucceededAction)
                .finished;
            return !(finished != undefined && finished);
        default:
            return state;
    }
}

function progressReducer(
    state: SignOffOverviewGroupsPageProgress = initialState.progress,
    action: SignOffOverviewGroupsFetchPageSucceededAction | SignOffOverviewFetchRequestedAction,
): SignOffOverviewGroupsPageProgress {
    switch (action.type) {
        case SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION:
        case SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION:
            return initialState.progress;
        case SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION:
            const groupPage = (action as SignOffOverviewGroupsFetchPageSucceededAction);
            return {
                total: groupPage.totalPages,
                loaded: groupPage.pageNumber + 1,
            };
        case SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION:
            const filterPage = (action as SignOffOverviewFilterSucceededAction);
            return {
                total: filterPage.totalPages,
                loaded: filterPage.pageNumber + 1,
            };
        default:
            return state;
    }
}

export default combineReducers<SignOffOverviewState>({
    groups: groupsReducer,
    signOffResults: resultsReducer,
    loading: loadingReducer,
    progress: progressReducer,
});
