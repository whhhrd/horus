import { ApplicationState } from "../state";
import { CourseDtoSummary } from "../types";
export const getCourses = (state: ApplicationState) => state.course !== undefined ? state.course!.courses : undefined;
export const getCourse = (state: ApplicationState, id: number) =>
    getCourses(state) === undefined ? undefined :
        getCourses(state)!.find((course: CourseDtoSummary) => course.id === id);
