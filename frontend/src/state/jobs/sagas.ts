import { notifyError } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import { authenticatedFetchJSON } from "../../api";
import { BatchJobDto } from "../../api/types";
import { JOBS_FETCH_REQUESTED_ACTION, JOB_ID_FETCH_REQUESTED_ACTION, JOB_REMOVE_REQUESTED_ACTION } from "./constants";
import {
    jobsFetchRequestSucceededAction,
    JobIdFetchRequestedAction,
    jobIdFetchRequestSucceededAction,
    JobRemoveRequestedAction,
    jobRemoveRequestSucceededAction,
} from "./action";

export function* getOwnJobs() {
    try {
        const jobs: BatchJobDto[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `jobs/self`,
        );
        yield put(jobsFetchRequestSucceededAction(jobs));
    } catch (e) {
        yield put(notifyError("Failed to fetch jobs"));
    }
}

export function* getJobWithId(action: JobIdFetchRequestedAction) {
    try {
        const job: BatchJobDto = yield call(
            authenticatedFetchJSON,
            "GET",
            `jobs/${action.jobId}`,
        );
        yield put(jobIdFetchRequestSucceededAction(job));
    } catch (e) {
        yield put(notifyError("Failed to fetch job"));
    }
}

export function* removeJob(action: JobRemoveRequestedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `jobs/${action.jobId}`,
        );
        yield put(jobRemoveRequestSucceededAction(action.jobId));
    } catch (e) {
        yield put(notifyError("Failed to remove job"));
    }
}

export default function* jobsSagas() {
    yield takeEvery(JOBS_FETCH_REQUESTED_ACTION, getOwnJobs);
    yield takeEvery(JOB_ID_FETCH_REQUESTED_ACTION, getJobWithId);
    yield takeEvery(JOB_REMOVE_REQUESTED_ACTION, removeJob);
}
