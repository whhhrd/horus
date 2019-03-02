import { CanvasSettingsState } from "./types";
import { CanvasCoursesReceivedAction, CanvasImportAction } from "./actions";
import {
    CANVAS_COURSES_REQUEST_SUCCEEDED_ACTION,
    IMPORT_CANVAS_COURSE_FINISHED_ACTION,
    IMPORT_CANVAS_COURSE_REQUESTED_ACTION,
} from "./constants";

const initialState: CanvasSettingsState = {
    currentlyImporting: [],
};

export default function canvasReducer(state: CanvasSettingsState, action: CanvasCoursesReceivedAction |
    CanvasImportAction): CanvasSettingsState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case IMPORT_CANVAS_COURSE_FINISHED_ACTION:
            return {
                currentlyImporting: state.currentlyImporting.filter((id: number) =>
                    id !== (action as CanvasImportAction).courseId),
                ...state,
            };
        case CANVAS_COURSES_REQUEST_SUCCEEDED_ACTION:
            return {
                canvasCourses: (action as CanvasCoursesReceivedAction).courses,
                ...state,
            };
        case IMPORT_CANVAS_COURSE_REQUESTED_ACTION:
            state.currentlyImporting.push((action as CanvasImportAction).courseId);
            return {
                currentlyImporting: state.currentlyImporting,
                ...state,
            };
        default:
            return state;
    }
}
