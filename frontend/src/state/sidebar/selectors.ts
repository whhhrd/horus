import { ApplicationState } from "../state";
export const isOpen = (state: ApplicationState) =>
    state.sidebar != undefined ? state.sidebar.isOpen : false;
