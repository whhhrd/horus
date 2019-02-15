import {
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_FAILED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_FAILED_ACTION,
} from "./constants";

import { AssignmentSetsState } from "./types";

const initialState: AssignmentSetsState = {
    assignmentSetDtoBriefs: null,
    assignmentGroupSetsMappingDtos: null,
    error: null,
};

function assignmentSetsReducer(state: AssignmentSetsState, action: any): AssignmentSetsState { // TODO replace 'any'
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case ASSIGNMENT_SET_DTO_BRIEFS_FETCH_REQUESTED_ACTION:
            return state; // Is this okay?
        case ASSIGNMENT_SET_DTO_BRIEFS_FETCH_SUCCEEDED_ACTION:
            return {
                ...state,
                error: null,
                assignmentSetDtoBriefs : action.assignmentSetDtoBriefs,
            };
        case ASSIGNMENT_SET_DTO_BRIEFS_FETCH_FAILED_ACTION:
            return {
                ...state,
                error: action.error,
            };
        case ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION:
            return state; // Is this okay?
        case ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_SUCCEEDED_ACTION:
            return  {
                ...state,
                error: null,
                assignmentGroupSetsMappingDtos: action.assignmentGroupSetsMappingDtos,
            };
        case ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_FAILED_ACTION:
            return {
                ...state,
                error: action.error,
            };
        default:
            return state;
    }
}

export default assignmentSetsReducer;
