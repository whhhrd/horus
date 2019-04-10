import {
    SignOffSearchQueryAction,
    signOffSearchSucceededAction,
} from "./action";
import { notifyError } from "../notifications/constants";
import { put, call, takeLatest } from "redux-saga/effects";
import { SIGN_OFF_SEARCH_QUERY_ACTION } from "./constants";
import { authenticatedFetchJSON } from "../../api";
import { GroupAssignmentSetSearchResultDto } from "../../api/types";

export function* signOffSearchQuery(action: SignOffSearchQueryAction) {
    try {
        const result: GroupAssignmentSetSearchResultDto = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.courseID}/groups/search`,
            { query: action.searchQuery },
        );
        yield put(signOffSearchSucceededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* searchSaga() {
    yield takeLatest(SIGN_OFF_SEARCH_QUERY_ACTION, signOffSearchQuery);
}
