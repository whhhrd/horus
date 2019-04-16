import { ApplicationState } from "../state";
import { CourseDtoSummary } from "../../api/types";

export const getCourses = (state: ApplicationState) =>
    state.course != null ? state.course.courses : null;

export const getCourse = (state: ApplicationState, id: number) => {
    if (state.course == null || state.course.courses == null) {
        return null;
    } else {
        const course = state.course.courses.find((c: CourseDtoSummary) => c.id === Number(id));
        return course != null ? course : null;
    }
};

export const getCourseFull = (state: ApplicationState, id: number) => {
    if (state.course == null || state.course.coursesFull == null) {
        return null;
    } else {
        const course = state.course.coursesFull.find((c: CourseDtoSummary) => c.id === Number(id));
        return course != null ? course : null;
    }
};

export const getCurrentParticipant = (state: ApplicationState) =>
    state.course != null ? state.course.currentParticipant : null;
