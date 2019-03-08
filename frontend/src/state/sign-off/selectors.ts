import { ApplicationState } from "../state";

export const getRemoteSignoffDetails = (state: ApplicationState) =>
    state.signOffs !== undefined ? state.signOffs.remoteResults : null;

export const getAssignmentSet = (state: ApplicationState) =>
    getRemoteSignoffDetails(state) !== null ? getRemoteSignoffDetails(state)!.assignmentSet : null;

export const getGroup = (state: ApplicationState) =>
    getRemoteSignoffDetails(state) !== null ? getRemoteSignoffDetails(state)!.group : null;

export const getRemoteSignoffs = (state: ApplicationState) =>
    getRemoteSignoffDetails(state) !== null ? getRemoteSignoffDetails(state)!.signOffs : null;

export const getLocalChanges = (state: ApplicationState) =>
    state.signOffs !== null ? (state.signOffs !== undefined ? state.signOffs.localChanges : null) : null;

export const isSaving = (state: ApplicationState) =>
    state.signOffs !== null ? (state.signOffs !== undefined ? state.signOffs.saving : false) : false;
