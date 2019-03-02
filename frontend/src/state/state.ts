import { AuthState } from "./auth/types";
import { AssignmentSetsState } from "./assignments/types";
import { CoursesState } from "./course-selection/types";
import { RouterState } from "connected-react-router";
import { NotificationsState } from "./notifications/types";
import { CanvasSettingsState } from "./canvas-settings/types";
import { NavigationBarState } from "./navigationBar/types";
import { GroupsState } from "./groups/types";

export interface ApplicationState {
    router?: RouterState;
    auth?: AuthState;
    assignmentSets?: AssignmentSetsState;
    course?: CoursesState;
    groups?: GroupsState;
    navigationBar?: NavigationBarState;
    notifications?: NotificationsState;
    canvasSettings?: CanvasSettingsState;
}
