import { Action } from "redux";

import {
    JOBS_FETCH_REQUEST_SUCCEEDED_ACTION,
    JOB_ID_FETCH_REQUESTED_ACTION,
    JOB_ID_FETCH_REQUEST_SUCCEEDED_ACTION,
    JOBS_FETCH_REQUESTED_ACTION,
    JOB_REMOVE_REQUESTED_ACTION,
    JOB_REMOVE_REQUEST_SUCCEEDED_ACTION,
    JOB_ADD_ACTION,
} from "./constants";
import { BatchJobDto } from "../../api/types";

// JOBS FETCH
export interface JobsFetchRequestSucceededAction extends Action<string> {
    jobs: BatchJobDto[];
}

export const jobsFetchRequestedAction = () => ({
    type: JOBS_FETCH_REQUESTED_ACTION,
});

export const jobsFetchRequestSucceededAction = (jobs: BatchJobDto[]) => ({
    type: JOBS_FETCH_REQUEST_SUCCEEDED_ACTION,
    jobs,
});

// JOB WITH ID FETCH
export interface JobIdFetchRequestedAction extends Action<string> {
    jobId: string;
}

export interface JobIdFetchRequestSucceededAction extends Action<string> {
    job: BatchJobDto;
}

export const jobIdFetchRequestedAction = (jobId: string) => ({
    type: JOB_ID_FETCH_REQUESTED_ACTION,
    jobId,
});

export const jobIdFetchRequestSucceededAction = (job: BatchJobDto) => ({
    type: JOB_ID_FETCH_REQUEST_SUCCEEDED_ACTION,
    job,
});

// JOB REMOVE
export interface JobRemoveRequestedAction extends Action<string> {
    jobId: string;
}

export interface JobRemoveRequestSucceededAction extends Action<string> {
    jobId: string;
}

export const jobRemoveRequestedAction = (jobId: string) => ({
    type: JOB_REMOVE_REQUESTED_ACTION,
    jobId,
});

export const jobRemoveRequestSucceededAction = (jobId: string) => ({
    type: JOB_REMOVE_REQUEST_SUCCEEDED_ACTION,
    jobId,
});

// JOB ADD
export interface JobAddAction extends Action<string> {
    job: BatchJobDto;
}

export const jobAddAction = (job: BatchJobDto) => ({ type: JOB_ADD_ACTION, job });
