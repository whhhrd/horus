import { CoursesState } from "./types";
import { CourseRequestAction } from "./action";
import { COURSES_REQUESTED_ACTION,
     COURSES_REQUEST_SUCCEEDED_ACTION,
      COURSES_REQUEST_FAILED_ACTION } from "./constants";

const initialState: CoursesState = {
};

export default function coursesReducer(state: CoursesState, action: CourseRequestAction): CoursesState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case COURSES_REQUESTED_ACTION:
            return initialState;
        case COURSES_REQUEST_SUCCEEDED_ACTION:
            return {
                courses: action.courses,
            };
        case COURSES_REQUEST_FAILED_ACTION:
            return {
                error: action.error,
            };
        default:
            return state;
    }
}
