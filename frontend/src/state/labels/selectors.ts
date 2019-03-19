import { ApplicationState } from "../state";

export const getLabels = (state: ApplicationState) =>
    state.labels != null ? state.labels.labels : null;
