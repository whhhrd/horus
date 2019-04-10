import { ApplicationState } from "../state";

export const getActiveTab = (state: ApplicationState) => {
    return state.navigationBar != null ? state.navigationBar.currentActiveTab : null;
};
