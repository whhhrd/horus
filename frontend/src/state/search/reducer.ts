import { GroupAssignmentSetCombination, SearchState } from "./types";
import {
    SignOffSearchSucceededAction,
} from "./action";
import {
    SIGN_OFF_SEARCH_SUCCEEDED_ACTION,
    SIGN_OFF_SEARCH_QUERY_ACTION,
} from "./constants";
import { AssignmentSetDtoBrief } from "../../api/types";

const initialState: SearchState = {
    searchResult: null,
};

export default function searchReducer(
    state: SearchState,
    action: SignOffSearchSucceededAction,
): SearchState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case SIGN_OFF_SEARCH_QUERY_ACTION:
            return {
                ...state,
                searchResult: null,
            };
        case SIGN_OFF_SEARCH_SUCCEEDED_ACTION:
            const searchResult = (action as SignOffSearchSucceededAction)
                .searchResult;
            const groupAssignmentSetCombinations: GroupAssignmentSetCombination[] = [];
            const assignmentSetsMap = getAssignmentSetsMap(
                searchResult.assignmentSets,
            );

            for (const group of searchResult.groups) {
                for (const linkedAssignmentSetID of group.assignmentSetIds) {
                    const groupAssignmentSetCombination: GroupAssignmentSetCombination = {
                        id: group.id,
                        name: group.name,
                        memberNames: group.memberNames,
                        assignmentSet: assignmentSetsMap[linkedAssignmentSetID],
                    };
                    groupAssignmentSetCombinations.push(
                        groupAssignmentSetCombination,
                    );
                }
            }
            return {
                ...state,
                searchResult: groupAssignmentSetCombinations,
            };
        default:
            return state;
    }
}

interface AssignmentSetsMap {
    [id: number]: AssignmentSetDtoBrief;
}

function getAssignmentSetsMap(
    assignmentSets: AssignmentSetDtoBrief[],
): AssignmentSetsMap {
    const assignmentSetsMap: AssignmentSetsMap = {};
    for (const assignmentSet of assignmentSets) {
        assignmentSetsMap[assignmentSet.id] = assignmentSet;
    }
    return assignmentSetsMap;
}
