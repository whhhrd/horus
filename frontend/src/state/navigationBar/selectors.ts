import { ApplicationState } from "../state";

export const getActiveTab = (state: ApplicationState) => {
    return state.navigationBar != null ? state.navigationBar.currentActiveTab : null;
};

export const getMatch = (state: ApplicationState) => {
    return state.navigationBar != null ? state.navigationBar.match : null;
};
