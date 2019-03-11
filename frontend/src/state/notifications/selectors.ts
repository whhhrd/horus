import { ApplicationState } from "../state";

export const getNotifications = (state: ApplicationState) =>
    state.notifications != null ? state.notifications!.notifications : null;
