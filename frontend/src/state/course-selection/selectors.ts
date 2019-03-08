import { ApplicationState } from "../state";
import { CourseDtoSummary } from "../types";

export const getCourses = (state: ApplicationState) =>
    state.course !== undefined ? state.course.courses : null;

export const getCourse = (state: ApplicationState, id: number) => {
    if (state.course === undefined || state.course.courses === null) {
        return null;
    } else {
        const course = state.course.courses.find((c: CourseDtoSummary) => c.id === Number(id));
        return course !== undefined ? course : null;
    }
};

export const getCourseFull = (state: ApplicationState, id: number) => {
    if (state.course === undefined || state.course.coursesFull === null) {
        return null;
    } else {
        const course = state.course.coursesFull.find((c: CourseDtoSummary) => c.id === Number(id));
        return course !== undefined ? course : null;
    }
};
