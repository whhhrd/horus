import { ApplicationState } from "../state";
export const isLoggedIn = (state: ApplicationState) =>
    state.auth != undefined ? state.auth.loggedIn : false;

export const getCoursePermissions = (state: ApplicationState) =>
    state.auth != undefined ? state.auth.coursePermissions : null;
