import { AuthState } from "./auth/types";
import { AssignmentSetsState } from "./assignments/types";
import { CoursesState } from "./course-selection/types";
import { RouterState } from "connected-react-router";
import { NotificationsState } from "./notifications/types";
import { CanvasSettingsState } from "./canvas-settings/types";
import { NavigationBarState } from "./navigationBar/types";
import { GroupsState } from "./groups/types";
import { SignOffState } from "./sign-off/types";
import { CommentsState } from "./comments/types";
import { SearchState } from "./search/types";
import { SidebarPhoneState } from "./sidebar/types";

export interface ApplicationState {
    router?: RouterState;
    auth?: AuthState;
    assignmentSets?: AssignmentSetsState;
    course?: CoursesState;
    groups?: GroupsState;
    comments?: CommentsState;
    navigationBar?: NavigationBarState;
    notifications?: NotificationsState;
    canvasSettings?: CanvasSettingsState;
    signOffs?: SignOffState;
    search?: SearchState;
    sidebar?: SidebarPhoneState;
}
