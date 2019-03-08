import { ApplicationState } from "../state";

export const getNotifications = (state: ApplicationState) =>
    state.notifications !== undefined ? state.notifications!.notifications : null;
