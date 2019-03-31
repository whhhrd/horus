import { AuthState } from "./auth/types";
import { AssignmentSetsState } from "./assignments/types";
import { CoursesState } from "./courses/types";
import { RouterState } from "connected-react-router";
import { NotificationsState } from "./notifications/types";
import { CanvasSettingsState } from "./canvas-settings/types";
import { NavigationBarState } from "./navigationBar/types";
import { GroupsState } from "./groups/types";
import { SignOffState } from "./sign-off/types";
import { CommentsState } from "./comments/types";
import { SearchState } from "./search/types";
import { SignOffOverviewState } from "./overview/types";
import { QueuingState } from "./queuing/types";
import { StudentDashboardState } from "./student-dashboard/types";
import { ParticipantsState } from "./participants/types";
import { LabelsState } from "./labels/types";
import { RolesState } from "./roles/types";
import { RoomsState } from "./rooms/types";

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
    overview?: SignOffOverviewState;
    queuing?: QueuingState;
    studentDashboard?: StudentDashboardState;
    labels?: LabelsState;
    participants?: ParticipantsState;
    roles?: RolesState;
    rooms?: RoomsState;
}
