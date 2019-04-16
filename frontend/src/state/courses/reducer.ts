import {
    CoursesRequestSucceededAction,
    CourseRequestSucceededAction,
    CurrentParticipantReceivedAction,
} from "./action";

import {
    COURSES_REQUEST_SUCCEEDED_ACTION,
    COURSE_REQUEST_SUCCEEDED_ACTION,
    COURSE_REQUESTED_ACTION,
    COURSES_REQUESTED_ACTION,
    CURRENT_PARTICIPANT_REQUESTED_ACTION,
    CURRENT_PARTICIPANT_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

import { CourseDtoSummary } from "../../api/types";
import { Action } from "redux";
import { CoursesState } from "./types";

const initialState: CoursesState = {
    courses: null,
    coursesFull: null,
    currentParticipant:  null,
};

export default function coursesReducer(
    state: CoursesState,
    action: Action,
): CoursesState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case COURSE_REQUESTED_ACTION:
            return {
                ...state,
                courses: null,
            };
        case COURSE_REQUEST_SUCCEEDED_ACTION:
            const course = (action as CourseRequestSucceededAction).course;

            if (state.courses != null) {
                const newCourses = state.courses.filter(
                    (c: CourseDtoSummary) => course.id !== c.id,
                );
                newCourses.push(course);
                return {
                    ...state,
                    courses: newCourses,
                    coursesFull: [course],
                };
            } else {
                return {
                    ...state,
                    courses: [course],
                    coursesFull: [course],
                };
            }
        case COURSES_REQUESTED_ACTION:
            return {
                ...state,
                courses: null,
            };
        case COURSES_REQUEST_SUCCEEDED_ACTION:
            const courses = (action as CoursesRequestSucceededAction).courses;
            return {
                ...state,
                courses,
            };
        case CURRENT_PARTICIPANT_REQUESTED_ACTION:
            return {
                ...state,
                currentParticipant: null,
            };
        case CURRENT_PARTICIPANT_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                currentParticipant: (action as CurrentParticipantReceivedAction)
                    .currentParticipant,
            };
        default:
            return state;
    }
}
