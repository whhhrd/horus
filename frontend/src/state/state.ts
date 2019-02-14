import { AuthState } from "./auth/types";
import { RouterState } from "connected-react-router";
import {CoursesState} from "./course-selection/types";
export interface ApplicationState {
    router?: RouterState;
    auth?: AuthState;
    course?: CoursesState;
}
