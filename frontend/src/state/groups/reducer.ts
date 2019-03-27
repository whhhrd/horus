import {
    GROUP_SETS_FETCH_REQUESTED_ACTION,
    GROUP_SETS_FETCH_SUCCEEDED_ACTION,
    GROUPS_FETCH_REQUESTED_ACTION,
    GROUPS_FETCH_SUCCEEDED_ACTION,
} from "./constants";

import {GroupsState} from "./types";
import {GroupSetsFetchSucceededAction, GroupsFetchSucceededAction} from "./actions";
import {
    CANVAS_REFRESH_SET_REQUEST_SUCCEEDED_ACTION,
    CANVAS_REFRESH_SETS_LIST_REQUEST_SUCCEEDED_ACTION,
} from "../canvas-settings/constants";

import {
    CanvasRefreshSetRequestSucceededAction,
    CanvasRefreshSetsListRequestSucceededAction,
} from "../canvas-settings/actions";
import {GroupDtoFull, ParticipantDtoBrief} from "../../api/types";
import {CommentDeleteSucceededAction} from "../comments/action";
import {COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION} from "../comments/constants";
import {EntityType} from "../comments/types";

const initialState: GroupsState = {
    groupSets: null,
    groups: null,
};

function groupsReducer(
    state: GroupsState, action:
        | GroupSetsFetchSucceededAction
        | GroupsFetchSucceededAction
        | CommentDeleteSucceededAction,
): GroupsState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case GROUP_SETS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                groupSets: initialState.groupSets,
            };
        case GROUP_SETS_FETCH_SUCCEEDED_ACTION:
            return {
                ...state,
                groupSets: (action as GroupSetsFetchSucceededAction).groupSets,
            };
        case GROUPS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                groups: initialState.groups,
            };
        case GROUPS_FETCH_SUCCEEDED_ACTION:
            return {
                ...state,
                groups: (action as GroupsFetchSucceededAction).groups,
            };
        case CANVAS_REFRESH_SETS_LIST_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                groupSets: (action as CanvasRefreshSetsListRequestSucceededAction).groupSets,
            };
        case CANVAS_REFRESH_SET_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                groups: (action as CanvasRefreshSetRequestSucceededAction).groups,
            };
        case COMMENT_DELETE_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                groups: commentDeleteReducer(state.groups, action as CommentDeleteSucceededAction),
            };
        default:
            return state;
    }
}

function commentDeleteReducer(state: GroupDtoFull[] | null,
                              action: CommentDeleteSucceededAction): GroupDtoFull[] | null {
    if (state == null) {
        return null;
    }

    const entityId = action.entityId;
    switch (action.entityType) {
        case EntityType.Participant:
            const newGroups: GroupDtoFull[] = [];
            state.forEach((group) => {
                const newParticipants: ParticipantDtoBrief[] = [];
                group.participants.forEach((participant) => {
                    if (participant.id === entityId) {
                        newParticipants.push({...participant, commentThread: action.commentThread});
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
                    updatedGroups.push({...group, commentThread: action.commentThread});
                } else {
                    updatedGroups.push(group);
                }
            });
            return updatedGroups;
        default:
            return state;
    }
}

export default groupsReducer;
