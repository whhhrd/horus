import { put, takeEvery, call } from "redux-saga/effects";

import {
    ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_UPDATE_REQUESTED_ACTION,
    ASSIGNMENT_SET_CREATE_REQUESTED_ACTION,
    ASSIGNMENTS_DELETE_CHECK_REQUESTED_ACTION,
    ASSIGNMENT_SET_DELETE_REQUESTED_ACTION,
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
    assignmentssDeleteCheckSucceededAction,
    AssignmentsDeleteCheckAction,
    AssignmentSetDeleteAction,
    assignmentSetDeleteRequestSuccededAction,
} from "./actions";

import { authenticatedFetchJSON } from "../../api/sagas";
import { AssignmentSetDtoBrief, AssignmentGroupSetsMappingDto, AssignmentSetDtoFull } from "../../api/types";
import { notifyError, notifySuccess } from "../notifications/constants";
import { AssignmentValue } from "./types";

export function* fetchAssignmentSets(action: AssignmentSetsFetchAction) {
    try {
        const assignmentSets: AssignmentSetDtoBrief[] =
            yield call(authenticatedFetchJSON, "GET", "courses/" + action.courseId + "/assignmentSets");

        yield put(assignmentSetsFetchSucceededAction(assignmentSets));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* fetchAssignmentGroupSetsMappings(action: AssignmentSetsFetchAction) {
    try {
        const assignmentGroupSetsMappings: AssignmentGroupSetsMappingDto[] =
            yield call(authenticatedFetchJSON, "GET", "courses/" + action.courseId + "/assignmentgroupsetsmappings");

        yield put(assignmentGroupSetsMappingsFetchSucceededAction(assignmentGroupSetsMappings));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* fetchAssignmentSet(action: AssignmentSetFetchAction) {

    try {
        const assignmentSet: AssignmentSetDtoFull =
            yield call(authenticatedFetchJSON, "GET", "assignmentSets/" + action.assignmentSetId);

        yield put(assignmentSetFetchSucceededAction(assignmentSet));
    } catch (e) {
        yield put(notifyError(e.message));
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
        yield put(notifyError(e.message));
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
        yield put(notifyError(e.message));
    }

}
export function* checkAssignmentsDelete(action: AssignmentsDeleteCheckAction) {
    // Request not needed if no assignments are given, saves us a fetch to the backend :)
    if (action.assignments.length === 0) {
        yield put(assignmentssDeleteCheckSucceededAction([]));
    } else {
        try {
            const result: boolean[] = yield call(authenticatedFetchJSON, "GET", "assignments/deletable",
                { assignmentIds: action.assignments.map((assignment: AssignmentValue) => assignment.id) });
            yield put(assignmentssDeleteCheckSucceededAction(action.assignments.filter((_, i: number) => !result[i])));
        } catch (e) {
            yield put(notifyError(e.message));
        }
    }
}
export function* deleteAssignmentSet(action: AssignmentSetDeleteAction) {
    try {
        yield call(authenticatedFetchJSON, "DELETE", `assignmentSets/${action.asid}`);
        yield put(assignmentSetDeleteRequestSuccededAction(action.asid));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export default function* assignmentSetSagas() {
    yield takeEvery(ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION, fetchAssignmentSets);
    yield takeEvery(ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION, fetchAssignmentGroupSetsMappings);
    yield takeEvery(ASSIGNMENT_SET_FETCH_REQUESTED_ACTION, fetchAssignmentSet);
    yield takeEvery(ASSIGNMENT_SET_UPDATE_REQUESTED_ACTION, updateAssignmentSet);
    yield takeEvery(ASSIGNMENT_SET_CREATE_REQUESTED_ACTION, createAssignmentSet);
    yield takeEvery(ASSIGNMENTS_DELETE_CHECK_REQUESTED_ACTION, checkAssignmentsDelete);
    yield takeEvery(ASSIGNMENT_SET_DELETE_REQUESTED_ACTION, deleteAssignmentSet);
}
