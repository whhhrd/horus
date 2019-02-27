import { History } from "history";
import { combineReducers } from "redux";

import authReducer from "./auth/reducer";
import assignmentSetsReducer from "./assignments/reducer";
import coursesReducer from "./course-selection/reducer";
import { ApplicationState } from "./state";
import { connectRouter } from "connected-react-router";
import navigationBarReducer from "./navigationBar/reducer";
import notificationsReducer from "./notifications/reducers";

// TODO: implement cleaning the state on log out.

export const rootReducer = (history: History) => combineReducers<ApplicationState>({
    router: connectRouter(history),
    auth: authReducer,
    assignmentSets: assignmentSetsReducer,
    course: coursesReducer,
    navigationBar:  navigationBarReducer,
    notifications: notificationsReducer,
} as any);
