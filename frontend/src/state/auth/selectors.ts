import { ApplicationState } from "../state";
export const isLoggedIn = (state: ApplicationState) => state.auth != null ? state.auth.loggedIn : false;
export const getCoursePermissions = (state: ApplicationState) => state.auth != null ?
    state.auth.coursePermissions : null;
