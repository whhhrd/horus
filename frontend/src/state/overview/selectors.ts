import { ApplicationState } from "../state";

export const getOverviewSignOffResults = (state: ApplicationState) =>
    state.overview != null ? state.overview.signOffResults : null;

export const getOverviewGroups = (state: ApplicationState) =>
    state.overview != null ? state.overview.groups : [];

export const getOverviewLoading = (state: ApplicationState) =>
    state.overview != null ? state.overview.loading : true;
