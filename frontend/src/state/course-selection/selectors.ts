import { ApplicationState } from "../state";
export const getCourses = (state: ApplicationState) => state.course !== undefined ? state.course!.courses : undefined;
export const getError = (state: ApplicationState) => state.course !== undefined ? state.course!.error : undefined;
