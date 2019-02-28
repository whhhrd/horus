import {
    GROUP_SETS_FETCH_REQUESTED_ACTION,
    GROUP_SETS_FETCH_SUCCEEDED_ACTION,
    GROUPS_FETCH_REQUESTED_ACTION,
    GROUPS_FETCH_SUCCEEDED_ACTION,
} from "./constants";

import { GroupsState } from "./types";
import { GroupSetsFetchSucceededAction, GroupsFetchSucceededAction } from "./actions";

const initialState: GroupsState = {
    groupSets: null,
    groups: null,
};

function groupsReducer(
        state: GroupsState, action: GroupSetsFetchSucceededAction | GroupsFetchSucceededAction,
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
                groupSets : (action as GroupSetsFetchSucceededAction).groupSets,
            };
        case GROUPS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                groups: initialState.groups,
            };
        case GROUPS_FETCH_SUCCEEDED_ACTION:
            return {
                ...state,
                groups : (action as GroupsFetchSucceededAction).groups,
            };
        default:
            return state;
    }
}

export default groupsReducer;
