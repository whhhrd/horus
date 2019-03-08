import { ApplicationState } from "../state";

export const isImporting = (state: ApplicationState, courseId: number) =>
    state.canvasSettings !== undefined && state.canvasSettings!.currentlyImporting.some((id: number) =>
    Number(courseId) === id);

export const getCanvasCourses = (state: ApplicationState) =>
    state.canvasSettings !== undefined ? state.canvasSettings!.canvasCourses : null;
