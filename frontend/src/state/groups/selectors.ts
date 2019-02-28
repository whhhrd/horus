import { ApplicationState } from "../state";

export const getGroupSets = (state: ApplicationState) => {
    return state.groups != null ? state.groups!.groupSets : null;
};

export const getGroups = (state: ApplicationState) => {
    return state.groups != null ? state.groups!.groups : null;
};
