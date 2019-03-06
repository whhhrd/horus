import {
    TOKEN_SUBMITTED_ACTION,
    CANVAS_COURSES_REQUESTED_ACTION,
    CANVAS_COURSES_REQUEST_SUCCEEDED_ACTION,
    IMPORT_CANVAS_COURSE_REQUESTED_ACTION,
    CHECK_TOKEN_AND_REDIRECT_TOKEN_ACTION,
    CHECK_TOKEN_AND_REDIRECT_IMPORT_ACTION,
    IMPORT_CANVAS_COURSE_FINISHED_ACTION,
    CANVAS_REFRESH_SETS_LIST_REQUESTED_ACTION,
    CANVAS_REFRESH_SETS_LIST_REQUEST_SUCCEEDED_ACTION,
    CANVAS_REFRESH_SET_REQUEST_SUCCEEDED_ACTION,
    CANVAS_REFRESH_SET_REQUESTED_ACTION,
} from "./constants";

import { CanvasCourseDto, GroupSetDtoSummary, GroupDtoFull } from "../types";
import { Action } from "redux";

export interface TokenSubmittedAction extends Action<string> {
    token: string;
}

export interface CanvasCoursesReceivedAction extends Action<string> {
    courses: CanvasCourseDto[];
}

export interface CanvasImportAction extends Action<string> {
    courseId: number;
}

export interface CanvasRefreshSetsListRequestedAction extends Action<string> {
    courseId: number;
}

export interface CanvasRefreshSetRequestedAction extends Action<string> {
    courseId: number;
    groupSetId: number;
}

export const tokenSubmitAction = (token: string) => ({ type: TOKEN_SUBMITTED_ACTION, token });

export const canvasCoursesRequestedAction = () => ({ type: CANVAS_COURSES_REQUESTED_ACTION });

export const canvasCoursesRequestSucceeededAction = (courses: CanvasCourseDto[]) =>
    ({ type: CANVAS_COURSES_REQUEST_SUCCEEDED_ACTION, courses });

export const importCanvasCourseAction = (courseId: number) =>
    ({ type: IMPORT_CANVAS_COURSE_REQUESTED_ACTION, courseId });

export const checkTokenAndRedirectImportAction = () => ({ type: CHECK_TOKEN_AND_REDIRECT_IMPORT_ACTION });

export const checkTokenAndRedirectTokenAction = () => ({ type: CHECK_TOKEN_AND_REDIRECT_TOKEN_ACTION });

export const importCanvasCourseFinishedAction = (courseId: number) =>
    ({ type: IMPORT_CANVAS_COURSE_FINISHED_ACTION, courseId });

// REFRESH SETS LIST
export interface CanvasRefreshSetsListRequestedAction extends Action<string> {
    courseId: number;
}

export interface CanvasRefreshSetsListRequestSucceededAction extends Action<string> {
    readonly groupSets: GroupSetDtoSummary[];
}

export const canvasRefreshSetsListRequestedAction = (courseId: number) =>
    ({ type: CANVAS_REFRESH_SETS_LIST_REQUESTED_ACTION, courseId });

export const canvasRefreshSetsListRequestSucceededAction = (groupSets: GroupSetDtoSummary[]) =>
    ({ type: CANVAS_REFRESH_SETS_LIST_REQUEST_SUCCEEDED_ACTION, groupSets });

// REFRESH SET
export interface CanvasRefreshSetRequestedAction extends Action<string> {
    courseId: number;
    groupSetId: number;
}

export interface CanvasRefreshSetRequestSucceededAction extends Action<string> {
    readonly groups: GroupDtoFull[];
}

export const canvasRefreshSetRequestedAction = (courseId: number, groupSetId: number) =>
    ({ type: CANVAS_REFRESH_SET_REQUESTED_ACTION, courseId, groupSetId });

export const canvasRefreshSetRequestSucceededAction = (groups: GroupDtoFull[]) =>
    ({ type: CANVAS_REFRESH_SET_REQUEST_SUCCEEDED_ACTION, groups });
