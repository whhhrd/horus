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
        const groupSets: GroupSetDtoSummary[] = yield call(
            authenticatedFetchJSON,
            "GET",
            "courses/" + action.courseId + "/groupSets",
        );

        yield put(groupSetsFetchSucceededAction(groupSets));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* fetchGroups(action: GroupsFetchAction) {
    try {
        const groups: GroupDtoFull[] = yield call(
            authenticatedFetchJSON,
            "GET",
            "groupSets/" + action.groupSetId + "/groups",
        );

        yield put(groupsFetchSucceededAction(groups));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* groupSagas() {
    yield takeEvery(GROUP_SETS_FETCH_REQUESTED_ACTION, fetchGroupSets);
    yield takeEvery(GROUPS_FETCH_REQUESTED_ACTION, fetchGroups);
}
