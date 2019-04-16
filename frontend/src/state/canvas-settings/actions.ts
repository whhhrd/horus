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
    CANVAS_IMPORT_GROUP_SET_REQUESTED_ACTION,
    CANVAS_REFRESH_PARTICIPANTS_REQUESTED_ACTION,
    CANVAS_REFRESH_PARTICIPANTS_REQUEST_SUCCEEDED_ACTION,
    CANVAS_REFRESH_COURSE_REQUESTED_ACTION,
    CANVAS_REFRESH_COURSE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

import {
    CanvasCourseDto,
    GroupSetDtoSummary,
    GroupDtoFull,
} from "../../api/types";
import { Action } from "redux";

// TOKEN SUBMIT AND CHECKING
export interface TokenSubmittedAction extends Action<string> {
    token: string;
}

export const tokenSubmitAction = (token: string) => ({
    type: TOKEN_SUBMITTED_ACTION,
    token,
});

export const checkTokenAndRedirectImportAction = () => ({
    type: CHECK_TOKEN_AND_REDIRECT_IMPORT_ACTION,
});

export const checkTokenAndRedirectTokenAction = () => ({
    type: CHECK_TOKEN_AND_REDIRECT_TOKEN_ACTION,
});

// CANVAS COURSES
export interface CanvasCoursesReceivedAction extends Action<string> {
    courses: CanvasCourseDto[];
}

export const canvasCoursesRequestedAction = () => ({
    type: CANVAS_COURSES_REQUESTED_ACTION,
});

export const canvasCoursesRequestSucceeededAction = (
    courses: CanvasCourseDto[],
) => ({ type: CANVAS_COURSES_REQUEST_SUCCEEDED_ACTION, courses });

// IMPORT CANVAS COURSE
export interface CanvasImportAction extends Action<string> {
    courseId: number;
}

export const importCanvasCourseAction = (courseId: number) => ({
    type: IMPORT_CANVAS_COURSE_REQUESTED_ACTION,
    courseId,
});

export const importCanvasCourseFinishedAction = (courseId: number) => ({
    type: IMPORT_CANVAS_COURSE_FINISHED_ACTION,
    courseId,
});

// REFRESH SETS LIST
export interface CanvasRefreshSetsListRequestedAction extends Action<string> {
    courseId: number;
}

export interface CanvasRefreshSetsListRequestSucceededAction
    extends Action<string> {
    readonly groupSets: GroupSetDtoSummary[];
}

export const canvasRefreshSetsListRequestedAction = (courseId: number) => ({
    type: CANVAS_REFRESH_SETS_LIST_REQUESTED_ACTION,
    courseId,
});

export const canvasRefreshSetsListRequestSucceededAction = (
    groupSets: GroupSetDtoSummary[],
) => ({ type: CANVAS_REFRESH_SETS_LIST_REQUEST_SUCCEEDED_ACTION, groupSets });

// REFRESH SET
export interface CanvasRefreshSetRequestedAction extends Action<string> {
    courseId: number;
    groupSetId: number;
}

export interface CanvasRefreshSetRequestSucceededAction extends Action<string> {
    readonly groups: GroupDtoFull[];
}

export const canvasRefreshSetRequestedAction = (
    courseId: number,
    groupSetId: number,
) => ({ type: CANVAS_REFRESH_SET_REQUESTED_ACTION, courseId, groupSetId });

export const canvasRefreshSetRequestSucceededAction = (
    groups: GroupDtoFull[],
) => ({ type: CANVAS_REFRESH_SET_REQUEST_SUCCEEDED_ACTION, groups });

// REFRESH PARTICIPANTS
export interface CanvasRefreshParticipantsRequestedAction extends Action<string> {
    courseId: number;
}

export const canvasRefreshParticipantsRequestedAction = (courseId: number) => ({
    type: CANVAS_REFRESH_PARTICIPANTS_REQUESTED_ACTION,
    courseId,
});

export const canvasRefreshParticipantsRequestSucceededAction = () => ({
    type: CANVAS_REFRESH_PARTICIPANTS_REQUEST_SUCCEEDED_ACTION,
});

// IMPORT GROUP SET
export interface CanvasGroupSetImportRequestedAction extends Action<string> {
    courseId: number;
    formData: FormData;
}

export const canvasGroupSetImportRequestedAction = (
    courseId: number,
    formData: FormData,
) => ({
    type: CANVAS_IMPORT_GROUP_SET_REQUESTED_ACTION,
    courseId,
    formData,
});

// REFRESH COURSE
export interface CanvasRefreshCourseRequestedAction extends Action<string> {
    courseId: number;
}

export const canvasRefreshCourseRequestedAction = (courseId: number) => ({
    type: CANVAS_REFRESH_COURSE_REQUESTED_ACTION,
    courseId,
});

export const canvasRefreshCourseRequestSucceededAction = () => ({
    type: CANVAS_REFRESH_COURSE_REQUEST_SUCCEEDED_ACTION,
});
