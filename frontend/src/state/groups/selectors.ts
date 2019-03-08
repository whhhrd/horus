import { ApplicationState } from "../state";

export const getGroupSets = (state: ApplicationState) => {
    return state.groups != undefined ? state.groups!.groupSets : null;
};

export const getGroups = (state: ApplicationState) => {
    return state.groups != undefined ? state.groups!.groups : null;
};
