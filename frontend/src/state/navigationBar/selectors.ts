import { ApplicationState } from "../state";

export const getActiveTab = (state: ApplicationState) => {
    return state.navigationBar != undefined ? state.navigationBar.currentActiveTab : null;
};

export const getMatch = (state: ApplicationState) => {
    return state.navigationBar != undefined ? state.navigationBar.match : null;
};
