import { ApplicationState } from "../state";

export const getJobs = (state: ApplicationState) =>
    state.jobs != null ? state.jobs.jobs : null;

export const getJob = (state: ApplicationState, jobId: string) => {
    if (state.jobs != null && state.jobs.jobs != null) {
        const job = state.jobs.jobs.find((j) => j.id === jobId);
        return job != null ? job : null;
    } else {
        return null;
    }
};
