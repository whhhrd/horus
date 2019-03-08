import { CanvasCourseDto } from "../types";

export interface CanvasSettingsState {
    canvasCourses: CanvasCourseDto[] | null;
    currentlyImporting: number[];
}
