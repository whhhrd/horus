import { put, takeEvery, call } from "redux-saga/effects";

import {
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION,
} from "./constants";

import {
    AssignmentSetDtoFetchAction,
    assignmentSetDtoBriefsFetchSucceededAction,
    assignmentGroupSetsMappingDtoFetchSucceededAction,
} from "./actions";

import { authenticatedFetchJSON } from "../../api/sagas";
import { AssignmentSetDtoBrief, AssignmentGroupSetsMappingDto } from "../types";
import { notifyError } from "../notifications/constants";

export function* fetchAssignmentSetDtoBriefs(action: AssignmentSetDtoFetchAction) {
    try {
        // Fetch AssignmentSetDtoBriefs using the API
        const assignmentSetDtoBriefs: AssignmentSetDtoBrief[] =
            yield call(authenticatedFetchJSON, "GET", "courses/" + action.courseID + "/assignmentSets");

        // If successful, update the state
        yield put(assignmentSetDtoBriefsFetchSucceededAction(assignmentSetDtoBriefs));
    } catch (e) {
        // Something went wrong, send an error to the AssignmentSetState
        yield put(notifyError("Failed to fetch assignment sets"));
    }
}

export function* fetchAssignmentGroupSetsMappingDto(action: AssignmentSetDtoFetchAction) {
    try {
        // Fetch AssignmentGroupSetsDTOs using the API
        const assignmentGroupSetsMappingDtos: AssignmentGroupSetsMappingDto[] =
            yield call(authenticatedFetchJSON, "GET", "courses/" + action.courseID + "/assignmentgroupsetsmappings");

        // If successful, update the state
        yield put(assignmentGroupSetsMappingDtoFetchSucceededAction(assignmentGroupSetsMappingDtos));
    } catch (e) {
        // Something went wrong, send an error to the AssignmentSetState
        yield put(notifyError("Failed to fetch assignment sets/group sets mapping"));
    }
}

export default function* assignmentSetSagas() {
    yield takeEvery(ASSIGNMENT_SET_DTO_BRIEFS_FETCH_REQUESTED_ACTION, fetchAssignmentSetDtoBriefs);
    yield takeEvery(ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION, fetchAssignmentGroupSetsMappingDto);
}
