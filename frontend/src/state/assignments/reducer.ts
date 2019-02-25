import {
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_SUCCEEDED_ACTION,
} from "./constants";

import { AssignmentSetsState } from "./types";

const initialState: AssignmentSetsState = {
    assignmentSetDtoBriefs: null,
    assignmentGroupSetsMappingDtos: null,
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
                assignmentSetDtoBriefs : action.assignmentSetDtoBriefs,
            };
        case ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION:
            return state; // Is this okay?
        case ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_SUCCEEDED_ACTION:
            return  {
                ...state,
                assignmentGroupSetsMappingDtos: action.assignmentGroupSetsMappingDtos,
            };
        default:
            return state;
    }
}

export default assignmentSetsReducer;
