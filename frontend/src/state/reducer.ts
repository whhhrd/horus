import coursesReducer from "./course-selection/reducer";
import { History } from "history";
import { combineReducers } from "redux";

import { connectRouter } from "connected-react-router";
import authReducer from "./auth/reducer";
import { ApplicationState } from "./state";

// TODO: implement cleaning the state on log out.

export const rootReducer = (history: History) => combineReducers<ApplicationState>({
    router: connectRouter(history),
    auth: authReducer,
    course: coursesReducer,
} as any);
