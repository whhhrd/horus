import { SearchState } from "./types";
import { SignOffSearchSucceededAction } from "./action";
import {
    SIGN_OFF_SEARCH_SUCCEEDED_ACTION,
} from "./constants";

const initialState: SearchState = {
};

export default function searchReducer(state: SearchState, action: SignOffSearchSucceededAction): SearchState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case SIGN_OFF_SEARCH_SUCCEEDED_ACTION:
            const searchResult = (action as SignOffSearchSucceededAction).searchResult;
            return {
                searchResult,
            };
        default:
            return state;
    }
}
