import { AuthState } from "./auth/types";
import { AssignmentSetsState } from "./courses/assignments/types";
import { CoursesState } from "./course-selection/types";
import { RouterState } from "connected-react-router";
import { NotificationsState } from "./notifications/types";
export interface ApplicationState {
    router?: RouterState;
    auth?: AuthState;
    assignmentSets?: AssignmentSetsState;
    course?: CoursesState;
    notifications?: NotificationsState;
}
