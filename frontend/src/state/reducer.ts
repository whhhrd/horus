import { History } from "history";
import { combineReducers } from "redux";

import authReducer from "./auth/reducer";
import assignmentSetsReducer from "./courses/assignments/reducer";
import coursesReducer from "./course-selection/reducer";
import { ApplicationState } from "./state";
import notificationsReducer from "./notifications/reducers";
import { connectRouter } from "connected-react-router";

// TODO: implement cleaning the state on log out.

export const rootReducer = (history: History) => combineReducers<ApplicationState>({
    router: connectRouter(history),
    auth: authReducer,
    assignmentSets: assignmentSetsReducer,
    course: coursesReducer,
    notifications: notificationsReducer,
} as any);
