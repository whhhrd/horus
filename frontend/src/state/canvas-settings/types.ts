import { CanvasCourseDto } from "../../api/types";

export interface CanvasSettingsState {
    canvasCourses: CanvasCourseDto[] | null;
    currentlyImporting: number[];
}
