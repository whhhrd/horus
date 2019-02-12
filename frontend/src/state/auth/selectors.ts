import { ApplicationState } from "../state";
export const isLoggedIn = (state: ApplicationState) => state.auth != null ? state.auth.loggedIn : false;
