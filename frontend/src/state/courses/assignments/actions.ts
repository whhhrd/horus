import {
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_SET_DTO_BRIEFS_FETCH_FAILED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_SUCCEEDED_ACTION,
    ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_FAILED_ACTION,
} from "./constants";

import { Action } from "redux";
import { AssignmentSetDtoBrief, AssignmentGroupSetsMappingDto } from "../../types";

export interface AssignmentSetDtoFetchAction extends Action<string> {
    readonly courseID: number;
}

export const assignmentSetDtoBriefsFetchRequestedAction = (courseID: number) =>
    ({ type: ASSIGNMENT_SET_DTO_BRIEFS_FETCH_REQUESTED_ACTION, courseID });

export const assignmentSetDtoBriefsFetchSucceededAction = (assignmentSetDtoBriefs: AssignmentSetDtoBrief[]) =>
    ({ type: ASSIGNMENT_SET_DTO_BRIEFS_FETCH_SUCCEEDED_ACTION, assignmentSetDtoBriefs });

export const assignmentSetDtoBriefsFetchFailedAction = (error: Error) =>
    ({ type: ASSIGNMENT_SET_DTO_BRIEFS_FETCH_FAILED_ACTION, error });

export const assignmentGroupSetsMappingDtoFetchRequestedAction = (courseID: number) =>
    ({ type: ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_REQUESTED_ACTION, courseID });

export const assignmentGroupSetsMappingDtoFetchSucceededAction = (
    assignmentGroupSetsMappingDtos: AssignmentGroupSetsMappingDto[]) =>
    ({ type: ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_SUCCEEDED_ACTION, assignmentGroupSetsMappingDtos });

export const assignmentGroupSetsMappingDtoFetchFailedAction = (error: Error) =>
    ({ type: ASSIGNMENT_GROUP_SETS_MAPPING_DTO_FETCH_FAILED_ACTION, error });
