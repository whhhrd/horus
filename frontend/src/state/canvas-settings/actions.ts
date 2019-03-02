import {
    TOKEN_SUBMITTED_ACTION,
    CANVAS_COURSES_REQUESTED_ACTION,
    CANVAS_COURSES_REQUEST_SUCCEEDED_ACTION,
    IMPORT_CANVAS_COURSE_REQUESTED_ACTION,
    CHECK_TOKEN_AND_REDIRECT_TOKEN_ACTION,
    CHECK_TOKEN_AND_REDIRECT_IMPORT_ACTION,
    IMPORT_CANVAS_COURSE_FINISHED_ACTION,
} from "./constants";
import { CanvasCourseDto } from "../types";
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
