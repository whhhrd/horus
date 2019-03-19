import { ApplicationState } from "../state";

export const getSignoffDetails = (state: ApplicationState) =>
    state.signOffs == null ? null : state.signOffs!.signOffs;

export const getAssignmentSet = (state: ApplicationState) =>
    getSignoffDetails(state) == null
        ? null
        : getSignoffDetails(state)!.assignmentSet;

export const getGroup = (state: ApplicationState) =>
    getSignoffDetails(state) == null ? null : getSignoffDetails(state)!.group;

export const getRemoteSignoffs = (state: ApplicationState) =>
    getSignoffDetails(state) == null
        ? null
        : getSignoffDetails(state)!.signOffs;

export const getSignOffHistory = (state: ApplicationState) =>
    state.signOffs == null ? null : state.signOffs.signOffHistory;
