import { put, takeEvery, call } from "redux-saga/effects";

import {
    GROUP_SETS_FETCH_REQUESTED_ACTION,
    GROUPS_FETCH_REQUESTED_ACTION,
} from "./constants";

import {
    GroupSetsFetchAction,
    groupSetsFetchSucceededAction,
    GroupsFetchAction,
    groupsFetchSucceededAction,
} from "./actions";

import { authenticatedFetchJSON } from "../../api/sagas";
import { GroupSetDtoSummary, GroupDtoFull } from "../../api/types";
import { notifyError } from "../notifications/constants";

export function* fetchGroupSets(action: GroupSetsFetchAction) {
    try {
        // Fetch AssignmentSetDtoBriefs using the API
        const groupSets: GroupSetDtoSummary[] =
            yield call(authenticatedFetchJSON, "GET", "courses/" + action.courseId + "/groupSets");

        // If successful, update the state
        yield put(groupSetsFetchSucceededAction(groupSets));
    } catch (e) {
        // Something went wrong, send an error
        yield put(notifyError("Failed to fetch group sets"));
    }
}

export function* fetchGroups(action: GroupsFetchAction) {
    try {
        // Fetch AssignmentSetDtoBriefs using the API
        const groups: GroupDtoFull[] =
            yield call(authenticatedFetchJSON, "GET", "groupSets/" + action.groupSetId + "/groups");

        // If successful, update the state
        yield put(groupsFetchSucceededAction(groups));
    } catch (e) {
        // Something went wrong, send an error
        yield put(notifyError("Failed to fetch groups"));
    }
}

export default function* groupSagas() {
    yield takeEvery(GROUP_SETS_FETCH_REQUESTED_ACTION, fetchGroupSets);
    yield takeEvery(GROUPS_FETCH_REQUESTED_ACTION, fetchGroups);
}
