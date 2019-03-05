import { put, takeEvery, call } from "redux-saga/effects";

import {
    ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_UPDATE_REQUESTED_ACTION,
    ASSIGNMENT_SET_CREATE_REQUESTED_ACTION,
} from "./constants";

import {
    AssignmentSetsFetchAction,
    assignmentSetsFetchSucceededAction,
    assignmentGroupSetsMappingsFetchSucceededAction,
    AssignmentSetFetchAction,
    AssignmentSetUpdateRequestedAction,
    AssignmentSetCreateRequestedAction,
    assignmentSetFetchSucceededAction,
    assignmentSetUpdateSucceededAction,
    assignmentSetCreateSucceededAction,
} from "./actions";

import { authenticatedFetchJSON } from "../../api/sagas";
import { AssignmentSetDtoBrief, AssignmentGroupSetsMappingDto, AssignmentSetDtoFull } from "../types";
import { notifyError, notifySuccess } from "../notifications/constants";

export function* fetchAssignmentSets(action: AssignmentSetsFetchAction) {
    try {
        // Fetch AssignmentSetDtoBriefs using the API
        const assignmentSets: AssignmentSetDtoBrief[] =
            yield call(authenticatedFetchJSON, "GET", "courses/" + action.courseId + "/assignmentSets");

        // If successful, update the state
        yield put(assignmentSetsFetchSucceededAction(assignmentSets));
    } catch (e) {
        // Something went wrong, send an error to the AssignmentSetState
        yield put(notifyError("Failed to fetch assignment sets"));
    }
}

export function* fetchAssignmentGroupSetsMappings(action: AssignmentSetsFetchAction) {
    try {
        const assignmentGroupSetsMappings: AssignmentGroupSetsMappingDto[] =
            yield call(authenticatedFetchJSON, "GET", "courses/" + action.courseId + "/assignmentgroupsetsmappings");

        // If successful, update the state
        yield put(assignmentGroupSetsMappingsFetchSucceededAction(assignmentGroupSetsMappings));
    } catch (e) {
        // Something went wrong, send an error to the AssignmentSetState
        yield put(notifyError("Failed to fetch assignment sets/group sets mapping"));
    }
}

export function* fetchAssignmentSet(action: AssignmentSetFetchAction) {

    try {
        const assignmentSet: AssignmentSetDtoFull =
            yield call(authenticatedFetchJSON, "GET", "assignmentSets/" + action.assignmentSetId);

        // If successful, update the state
        yield put(assignmentSetFetchSucceededAction(assignmentSet));
    } catch (e) {
        // Something went wrong, send an error to the AssignmentSetState
        yield put(notifyError("Failed to fetch assignment sets"));
    }
}

export function* updateAssignmentSet(action: AssignmentSetUpdateRequestedAction) {
    try {
        const assignmentSetDtoFull: AssignmentSetDtoFull =
            yield call(authenticatedFetchJSON, "PUT", `assignmentSets/${action.assignmentSetId}`,
                null, action.assignmentSetUpdate);

        yield put(assignmentSetUpdateSucceededAction(assignmentSetDtoFull));
        yield put(notifySuccess("Assignment set successfully edited!"));
    } catch (e) {
        yield put(notifyError("Editing the assignment set failed"));
    }

}

export function* createAssignmentSet(action: AssignmentSetCreateRequestedAction) {
    try {
        const assignmentSet: AssignmentSetDtoFull =
            yield call(authenticatedFetchJSON, "POST", `courses/${action.courseId}/assignmentSets`,
                null, action.assignmentSetCreate);

        yield put(assignmentSetCreateSucceededAction(assignmentSet));
        yield put(notifySuccess("Assignment set successfully created!"));
    } catch (e) {
        yield put(notifyError("Creating the assignment set failed"));
    }

}

export default function* assignmentSetSagas() {
    yield takeEvery(ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION, fetchAssignmentSets);
    yield takeEvery(ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION, fetchAssignmentGroupSetsMappings);
    yield takeEvery(ASSIGNMENT_SET_FETCH_REQUESTED_ACTION, fetchAssignmentSet);
    yield takeEvery(ASSIGNMENT_SET_UPDATE_REQUESTED_ACTION, updateAssignmentSet);
    yield takeEvery(ASSIGNMENT_SET_CREATE_REQUESTED_ACTION, createAssignmentSet);
}
