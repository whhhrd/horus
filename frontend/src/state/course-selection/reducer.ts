import { CoursesState } from "./types";
import { CoursesRequestSucceededAction } from "./action";
import {
    COURSES_REQUEST_SUCCEEDED_ACTION,
    COURSE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import { CourseDtoSummary } from "../types";

const initialState: CoursesState = {
};

export default function coursesReducer(state: CoursesState, action: CoursesRequestSucceededAction): CoursesState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case COURSES_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                courses: action.courses,
            };
        case COURSE_REQUEST_SUCCEEDED_ACTION:
            if (state.courses !== undefined) {
                const newCourses = state.courses!.filter((course: CourseDtoSummary) =>
                    course.id !== action.course!.id);
                newCourses.push(action.course!);
                return {
                    courses: newCourses,
                    courseDtoFull: action.course,
                };
            } else {
                return {
                    courses: [action.course!],
                    courseDtoFull: action.course,
                };
            }
        default:
            return state;
    }
}
