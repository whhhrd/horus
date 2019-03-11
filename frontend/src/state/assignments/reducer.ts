import {
    ASSIGNMENT_SETS_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_CREATE_REQUEST_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_UPDATE_REQUEST_SUCCEEDED_ACTION,
    ASSIGNMENTS_DELETE_CHECK_SUCCEEDED_ACTION,
    ASSIGNMENTS_DELETE_CHECK_REQUESTED_ACTION,
    ASSIGNMENT_SET_DELETE_REQUEST_SUCCEEDED_ACTION,
    RESET_DELETE_CHECK_ACTION,
} from "./constants";

import { AssignmentSetsState } from "./types";
import { AssignmentSetDtoFull, AssignmentSetDtoBrief } from "../../api/types";
import {
    AssignmentSetsFetchSucceededAction,
    AssignmentGroupSetsMappingsFetchSucceededAction,
    AssignmentSetFetchSucceededAction,
    AssignmentSetFetchAction,
    AssignmentSetCreateSucceededAction,
    AssignmentSetUpdateSucceededAction,
    AssignmentsDeleteCheckAction,
    AssignmentSetDeleteAction,
} from "./actions";
import { Action } from "redux";

const initialState: AssignmentSetsState = {
    assignmentSets: null,
    assignmentSetBriefs: null,
    assignmentGroupSetsMappings: null,
    deleteCheck: null,
    deleteOK: false,
};

function updateAssignmentSetsState(state: AssignmentSetsState, assignmentSet: AssignmentSetDtoFull) {
    const newState = {
        ...state,
    };

    if (state.assignmentSets != null) {
        newState.assignmentSets!.set(assignmentSet.id, assignmentSet);
    }

    if (newState.assignmentSetBriefs != null) {
        if (newState.assignmentSetBriefs.find((value) => value.id === assignmentSet.id)) {
            const index = newState.assignmentSetBriefs.findIndex((value) => value.id === assignmentSet.id);
            newState.assignmentSetBriefs![index] = assignmentSet;
        } else {
            newState.assignmentSetBriefs.push(assignmentSet);
        }
    }

    if (newState.assignmentGroupSetsMappings != null) {
        newState.assignmentGroupSetsMappings = newState.assignmentGroupSetsMappings.filter(
            (value) => value.assignmentSet.id !== assignmentSet.id,
        );
        newState.assignmentGroupSetsMappings.push(...(assignmentSet.groupSetMappings));
    }

    return newState;
}

function assignmentSetsReducer(state: AssignmentSetsState, action: Action<string>) {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                assignmentSetBriefs: initialState.assignmentSets,
            };
        case ASSIGNMENT_SETS_FETCH_SUCCEEDED_ACTION:
            return {
                ...state,
                assignmentSetBriefs: (action as AssignmentSetsFetchSucceededAction).assignmentSets,
            };
        case ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                assignmentGroupSetsMappings: initialState.assignmentGroupSetsMappings,
            };
        case ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_SUCCEEDED_ACTION:
            return {
                ...state,
                assignmentGroupSetsMappings:
                    (action as AssignmentGroupSetsMappingsFetchSucceededAction).assignmentGroupSetsMappings,
            };
        case ASSIGNMENT_SET_FETCH_REQUESTED_ACTION:
            const asid = (action as AssignmentSetFetchAction).assignmentSetId;
            if (state.assignmentSets == null) {
                const newAssignmentSets = new Map<number, AssignmentSetDtoFull>();
                return {
                    ...state,
                    assignmentSets: newAssignmentSets,
                };
            } else {
                const newAssignmentSets = state.assignmentSets;
                newAssignmentSets.delete(asid);
                return {
                    ...state,
                    assignmentSets: newAssignmentSets,
                };
            }
        case ASSIGNMENT_SET_FETCH_SUCCEEDED_ACTION: {
            const assignmentSet = (action as AssignmentSetFetchSucceededAction).assignmentSet;
            return updateAssignmentSetsState(state, assignmentSet);
        }
        case ASSIGNMENT_SET_CREATE_REQUEST_SUCCEEDED_ACTION: {
            const assignmentSet = (action as AssignmentSetCreateSucceededAction).assignmentSet;
            return updateAssignmentSetsState(state, assignmentSet);
        }
        case ASSIGNMENT_SET_UPDATE_REQUEST_SUCCEEDED_ACTION: {
            const assignmentSet = (action as AssignmentSetUpdateSucceededAction).assignmentSet;
            return updateAssignmentSetsState(state, assignmentSet);
        }
        case ASSIGNMENTS_DELETE_CHECK_REQUESTED_ACTION: {
            return {
                ...state,
                deleteOK: false,
            };
        }
        case ASSIGNMENTS_DELETE_CHECK_SUCCEEDED_ACTION: {
            return {
                ...state,
                deleteCheck: (action as AssignmentsDeleteCheckAction).assignments,
                deleteOK: true,
            };
        }
        case ASSIGNMENT_SET_DELETE_REQUEST_SUCCEEDED_ACTION: {
            const newAssignmentSets = state.assignmentSets;
            newAssignmentSets!.delete((action as AssignmentSetDeleteAction).asid);
            return {
                ...state,
                assignmentSets: newAssignmentSets,
                assignmentSetBriefs: state.assignmentSetBriefs!.filter((assignmentSet: AssignmentSetDtoBrief) =>
                    assignmentSet.id !== (action as AssignmentSetDeleteAction).asid),
            };
        }
        case RESET_DELETE_CHECK_ACTION: {
            return {
                ...state,
                deleteCheck: null,
                deleteOK: false,
            };
        }
        default:
            return state;
    }
}

export default assignmentSetsReducer;
