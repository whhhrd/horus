import {Action} from "redux";

import { COURSES_REQUESTED_ACTION,
     COURSES_REQUEST_SUCCEEDED_ACTION,
      COURSES_REQUEST_FAILED_ACTION } from "./constants";
import { CourseDtoSummary } from "../types";

export interface CourseRequestAction extends Action<string> {
    readonly courses?: CourseDtoSummary[];
    readonly error?: Error;
}

export const coursesRequestedAction = () => ({type: COURSES_REQUESTED_ACTION});
export const coursesRequestSucceededAction = (courses: CourseDtoSummary[]) =>
                        ({type: COURSES_REQUEST_SUCCEEDED_ACTION, courses});
export const coursesRequestFailedAction = (error: Error) => ({type: COURSES_REQUEST_FAILED_ACTION, error});
