import {
    ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SETS_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_UPDATE_REQUESTED_ACTION,
    ASSIGNMENT_SET_CREATE_REQUESTED_ACTION,
    ASSIGNMENT_SET_UPDATE_REQUEST_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_CREATE_REQUEST_SUCCEEDED_ACTION,
    ASSIGNMENTS_DELETE_CHECK_REQUESTED_ACTION,
    ASSIGNMENTS_DELETE_CHECK_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_DELETE_REQUESTED_ACTION,
    ASSIGNMENT_SET_DELETE_REQUEST_SUCCEEDED_ACTION,
    RESET_DELETE_CHECK_ACTION,
} from "./constants";

import { Action } from "redux";
import {
    AssignmentSetDtoBrief,
    AssignmentGroupSetsMappingDto,
    AssignmentSetDtoFull,
    AssignmentSetUpdateDto,
    AssignmentSetCreateDto,
} from "../../api/types";
import { AssignmentValue } from "./types";

// BRIEFS
export interface AssignmentSetsFetchAction extends Action<string> {
    readonly courseId: number;
}

export interface AssignmentSetsFetchSucceededAction extends Action<string> {
    readonly assignmentSets: AssignmentSetDtoBrief[];
}

export const assignmentSetsFetchRequestedAction = (courseId: number) =>
    ({ type: ASSIGNMENT_SETS_FETCH_REQUESTED_ACTION, courseId });

export const assignmentSetsFetchSucceededAction = (assignmentSets: AssignmentSetDtoBrief[]) =>
    ({ type: ASSIGNMENT_SETS_FETCH_SUCCEEDED_ACTION, assignmentSets });

// FULL
export interface AssignmentSetFetchAction extends Action<string> {
    readonly assignmentSetId: number;
}

export interface AssignmentSetFetchSucceededAction extends Action<string> {
    readonly assignmentSet: AssignmentSetDtoFull;
}

export const assignmentSetFetchRequestedAction = (assignmentSetId: number) =>
    ({ type: ASSIGNMENT_SET_FETCH_REQUESTED_ACTION, assignmentSetId });

export const assignmentSetFetchSucceededAction = (assignmentSet: AssignmentSetDtoFull) =>
    ({ type: ASSIGNMENT_SET_FETCH_SUCCEEDED_ACTION, assignmentSet });

// MAPPINGS
export interface AssignmentGroupSetsMappingsFetchSucceededAction extends Action<string> {
    readonly assignmentGroupSetsMappings: AssignmentGroupSetsMappingDto[];
}

export const assignmentGroupSetsMappingsFetchRequestedAction = (courseId: number) =>
    ({ type: ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_REQUESTED_ACTION, courseId });

export const assignmentGroupSetsMappingsFetchSucceededAction = (
    assignmentGroupSetsMappings: AssignmentGroupSetsMappingDto[]) =>
    ({ type: ASSIGNMENT_GROUP_SETS_MAPPINGS_FETCH_SUCCEEDED_ACTION, assignmentGroupSetsMappings });

// UPDATE
export interface AssignmentSetUpdateRequestedAction extends Action<string> {
    readonly assignmentSetId: number;
    readonly assignmentSetUpdate: AssignmentSetUpdateDto;
}

export interface AssignmentSetUpdateSucceededAction extends Action<string> {
    readonly assignmentSet: AssignmentSetDtoFull;
}

export const assignmentSetUpdateRequestedAction = (assignmentSetId: number,
                                                   assignmentSetUpdate: AssignmentSetUpdateDto) =>
    ({ type: ASSIGNMENT_SET_UPDATE_REQUESTED_ACTION, assignmentSetId, assignmentSetUpdate });

export const assignmentSetUpdateSucceededAction = (assignmentSet: AssignmentSetDtoFull) =>
    ({ type: ASSIGNMENT_SET_UPDATE_REQUEST_SUCCEEDED_ACTION, assignmentSet });

// CREATE
export interface AssignmentSetCreateRequestedAction extends Action<string> {
    readonly courseId: number;
    readonly assignmentSetCreate: AssignmentSetCreateDto;
}

export interface AssignmentSetCreateSucceededAction extends Action<string> {
    readonly assignmentSet: AssignmentSetDtoFull;
}

export const assignmentSetCreateRequestedAction = (courseId: number, assignmentSetCreate: AssignmentSetCreateDto) =>
    ({ type: ASSIGNMENT_SET_CREATE_REQUESTED_ACTION, courseId, assignmentSetCreate });

export const assignmentSetCreateSucceededAction = (assignmentSet: AssignmentSetDtoFull) =>
    ({ type: ASSIGNMENT_SET_CREATE_REQUEST_SUCCEEDED_ACTION, assignmentSet });

// DELETE CHECK
export interface AssignmentsDeleteCheckAction extends Action<string> {
    readonly assignments: AssignmentValue[];
}
export const assignmentsDeleteCheckRequestedAction = (assignments: AssignmentValue[]) =>
    ({ type: ASSIGNMENTS_DELETE_CHECK_REQUESTED_ACTION, assignments });

export const assignmentssDeleteCheckSucceededAction = (assignments: AssignmentValue[]) =>
    ({ type: ASSIGNMENTS_DELETE_CHECK_SUCCEEDED_ACTION, assignments });

export const resetDeleteCheckAction = () =>
    ({ type: RESET_DELETE_CHECK_ACTION });

// DELETE Assignment Set
export interface AssignmentSetDeleteAction extends Action<string> {
    asid: number;
}

export const assignmentSetDeleteRequestedAction = (asid: number) =>
    ({ type: ASSIGNMENT_SET_DELETE_REQUESTED_ACTION, asid });

export const assignmentSetDeleteRequestSuccededAction = (asid: number) =>
    ({ type: ASSIGNMENT_SET_DELETE_REQUEST_SUCCEEDED_ACTION, asid });
