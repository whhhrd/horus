import { Action } from "redux";

import {
    COURSES_REQUESTED_ACTION,
    COURSES_REQUEST_SUCCEEDED_ACTION,
    COURSE_REQUESTED_ACTION,
    COURSE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import { CourseDtoSummary, CourseDtoFull } from "../types";

// REQUEST COURSES
export interface CoursesRequestedAction extends Action<string> {
    readonly id: number;
}

export interface CoursesRequestSucceededAction extends Action<string> {
    readonly courses: CourseDtoSummary[];
}

export const coursesRequestedAction = () => ({ type: COURSES_REQUESTED_ACTION });

export const coursesRequestSucceededAction = (courses: CourseDtoSummary[]) =>
    ({ type: COURSES_REQUEST_SUCCEEDED_ACTION, courses });

// REQUEST COURSE
export interface CourseRequestedAction extends Action<string> {
    readonly id: number;
}

export interface CourseRequestSucceededAction extends Action<string> {
    readonly course: CourseDtoFull;
}

export const courseRequestedAction = (id: number) =>
    ({ type: COURSE_REQUESTED_ACTION, id });

export const courseRequestSucceededAction = (course: CourseDtoFull) =>
    ({ type: COURSE_REQUEST_SUCCEEDED_ACTION, course });
