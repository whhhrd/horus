import { ApplicationState } from "../state";

export const getRemoteSignoffDetails = (state: ApplicationState) => state.signOffs === undefined ? undefined :
    state.signOffs!.remoteResults;
export const getAssignmentSet = (state: ApplicationState) => getRemoteSignoffDetails(state) === undefined ? undefined :
    getRemoteSignoffDetails(state)!.assignmentSet;
export const getGroup = (state: ApplicationState) => getRemoteSignoffDetails(state) === undefined ? undefined :
    getRemoteSignoffDetails(state)!.group;
export const getRemoteSignoffs = (state: ApplicationState) => getRemoteSignoffDetails(state) === undefined ? undefined :
    getRemoteSignoffDetails(state)!.signOffs;
export const getLocalChanges = (state: ApplicationState) => state.signOffs === undefined ? undefined :
    state.signOffs.localChanges;
export const isSaving = (state: ApplicationState) => state.signOffs === undefined ? false :  state.signOffs.saving;
