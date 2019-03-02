import { CanvasCourseDto } from "../types";

export interface CanvasSettingsState {
    canvasCourses?: CanvasCourseDto[];
    currentlyImporting: number[];
}
