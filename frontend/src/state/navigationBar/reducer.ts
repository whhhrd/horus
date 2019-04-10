import { NAVIGATION_BAR_SET_TAB_ACTION } from "./constants";

import { NavigationBarState } from "./types";
import { SetActiveNavigationTabAction } from "./actions";

const initialState: NavigationBarState = {
    currentActiveTab: null,
};

function navigationBarReducer(
    state: NavigationBarState,
    action: SetActiveNavigationTabAction,
): NavigationBarState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case NAVIGATION_BAR_SET_TAB_ACTION:
            return {
                ...state,
                currentActiveTab: action.tab,
            };
        default:
            return state;
    }
}

export default navigationBarReducer;
