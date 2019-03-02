import { History } from "history";
import { combineReducers } from "redux";

import authReducer from "./auth/reducer";
import assignmentSetsReducer from "./assignments/reducer";
import coursesReducer from "./course-selection/reducer";
import { ApplicationState } from "./state";
import { connectRouter } from "connected-react-router";
import notificationsReducer from "./notifications/reducers";
import canvasReducer from "./canvas-settings/reducer";
import navigationBarReducer from "./navigationBar/reducer";
import groupsReducer from "./groups/reducer";

// TODO: implement cleaning the state on log out.
export const rootReducer = (history: History) => combineReducers<ApplicationState>({
    router: connectRouter(history),
    auth: authReducer,
    assignmentSets: assignmentSetsReducer,
    groups: groupsReducer,
    course: coursesReducer,
    navigationBar:  navigationBarReducer   ,
    notifications: notificationsReducer,
    canvasSettings: canvasReducer,
} as any);
