import { NAVIGATION_BAR_SET_TAB_SUCCEEDED_ACTION, NAVIGATION_BAR_SET_MATCH_SUCCEEDED_ACTION } from "./constants";

import { NavigationBarState } from "./types";

const initialState: NavigationBarState = {
    currentActiveTab: null,
    match: null,
};

function navigationBarReducer(state: NavigationBarState, action: any): NavigationBarState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case NAVIGATION_BAR_SET_TAB_SUCCEEDED_ACTION:
            return {
                ...state,
                currentActiveTab: action.tab,
            };
        case NAVIGATION_BAR_SET_MATCH_SUCCEEDED_ACTION:
            return {
                ...state,
                match: action.match,
            };
        default:
            return state;
    }
}

export default navigationBarReducer;
