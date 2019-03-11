import { ApplicationState } from "../state";

export const isImporting = (state: ApplicationState, courseId: number) =>
    state.canvasSettings != null && state.canvasSettings!.currentlyImporting.some((id: number) =>
    Number(courseId) === id);

export const getCanvasCourses = (state: ApplicationState) =>
    state.canvasSettings != null ? state.canvasSettings!.canvasCourses : null;
