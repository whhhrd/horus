import { Action } from "redux";
import { JobsState } from "./types";
import {
    JOBS_FETCH_REQUESTED_ACTION,
    JOBS_FETCH_REQUEST_SUCCEEDED_ACTION,
    JOB_ID_FETCH_REQUEST_SUCCEEDED_ACTION,
    JOB_REMOVE_REQUEST_SUCCEEDED_ACTION,
    JOB_ADD_ACTION,
} from "./constants";
import {
    JobsFetchRequestSucceededAction,
    JobIdFetchRequestSucceededAction,
    JobRemoveRequestSucceededAction,
    JobAddAction,
} from "./action";

const initialState: JobsState = {
    jobs: null,
};

export default function jobsReducer(
    state: JobsState,
    action: Action,
): JobsState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case JOBS_FETCH_REQUESTED_ACTION:
            return {
                ...state,
                jobs: null,
            };
        case JOBS_FETCH_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                jobs: (action as JobsFetchRequestSucceededAction).jobs,
            };
        case JOB_ID_FETCH_REQUEST_SUCCEEDED_ACTION: {
            const newJobs = state.jobs != null ? state.jobs.slice() : [];
            const newJob = (action as JobIdFetchRequestSucceededAction).job;
            const oldJob = newJobs.find((j) => j.id === newJob.id);

            if (oldJob != null) {
                const oldJobIndex = newJobs.indexOf(oldJob);
                newJobs[oldJobIndex] = newJob;
            } else {
                newJobs.push(newJob);
            }

            return {
                ...state,
                jobs: newJobs,
            };
        }
        case JOB_REMOVE_REQUEST_SUCCEEDED_ACTION: {
            const newJobs = state.jobs != null ? state.jobs.slice() : [];
            const jobToDelete = newJobs.find(
                (j) =>
                    j.id === (action as JobRemoveRequestSucceededAction).jobId,
            );

            if (jobToDelete) {
                const jobToDeleteIndex = newJobs.indexOf(jobToDelete);
                newJobs.splice(jobToDeleteIndex, 1);
            }

            return {
                ...state,
                jobs: newJobs,
            };
        }
        case JOB_ADD_ACTION: {
            const newJobs = state.jobs != null ? state.jobs.slice() : [];
            newJobs.push((action as JobAddAction).job);
            return {
                ...state,
                jobs: newJobs,
            };
        }
        default:
            return state;
    }
}
