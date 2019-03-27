import {
    SignOffOverviewState,
    SignOffOverviewFetchRequestedAction,
    SignOffOverviewGroupsFetchPageSucceededAction,
    SignOffOverviewResultsFetchSucceededAction,
    SignOffOverviewAction,
    SignOffResultsMap,
} from "./types";
import { GroupDtoFull } from "../../api/types";
import {
    SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION,
} from "./constants";
import { combineReducers } from "redux";
import { SignOffOverviewFilterSucceededAction } from "./actions";

const initialState: SignOffOverviewState = {
    groups: [],
    signOffResults: new Map(),
    loading: false,
};

function groupsReducer(
    state: GroupDtoFull[] = initialState.groups,
    action:
        | SignOffOverviewFetchRequestedAction
        | SignOffOverviewGroupsFetchPageSucceededAction
        | SignOffOverviewFilterSucceededAction,
): GroupDtoFull[] {
    switch (action.type) {
        case SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION:
            return initialState.groups;
        case SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION:
            const groups = (action as SignOffOverviewGroupsFetchPageSucceededAction)
                .groups;
            return [...state, ...groups];
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
    action: SignOffOverviewResultsFetchSucceededAction,
): SignOffResultsMap {
    switch (action.type) {
        case SIGN_OFF_OVERVIEW_RESULTS_FETCH_SUCCEEDED_ACTION:
            const map: SignOffResultsMap = new Map();
            action.results.forEach((result) => {
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
        default:
            return state;
    }
}

function loadingReducer(
    state: boolean = false,
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

export default combineReducers<SignOffOverviewState>({
    groups: groupsReducer,
    signOffResults: resultsReducer,
    loading: loadingReducer,
});
