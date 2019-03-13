import {
    SignOffOverviewFetchRequestedAction,
    SignOffOverviewResultsFetchRequestedAction,
} from "./types";
import { notifyError } from "../notifications/constants";
import { put, takeEvery, call } from "redux-saga/effects";
import { authenticatedFetchJSON } from "../../api";
import { SpringPage } from "../../api/spring-types";
import { GroupDtoFull, SignOffResultDtoCompact } from "../../api/types";
import {
    overviewGroupsPageFetchSucceededAction,
    overviewGroupsFetchSucceededAction,
    overviewSignOffResultsRequestSucceededAction,
} from "./actions";
import {
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_REQUESTED_ACTION,
} from "./constants";

function* getSignOffResults(
    action: SignOffOverviewResultsFetchRequestedAction,
) {
    try {
        const results: SignOffResultDtoCompact[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.courseId}/signoffresults`,
            {
                assignmentSetId: action.assignmentSetId,
            },
        );
        yield put(
            overviewSignOffResultsRequestSucceededAction(
                results,
                action.courseId,
                action.assignmentSetId,
            ),
        );
    } catch (e) {
        yield put(notifyError("Failed to fetch signoffs"));
    }
}

function* getAssignmentSetGroups(action: SignOffOverviewFetchRequestedAction) {
    try {
        const groups: GroupDtoFull[] = [];
        let page: SpringPage<GroupDtoFull> = yield call(
            authenticatedFetchJSON,
            "GET",
            `assignmentSets/${action.assignmentSetId}/groups?sort=groupSet.id,id`,
        );
        groups.push(...page.content);
        yield put(
            overviewGroupsPageFetchSucceededAction(
                action.courseId,
                action.assignmentSetId,
                page.content,
            ),
        );
        while (!page.last) {
            page = yield call(
                authenticatedFetchJSON,
                "GET",
                `assignmentSets/${action.assignmentSetId}/groups?sort=groupSet.id,id&page=${page.number + 1}`,
            );
            groups.push(...page.content);
            yield put(
                overviewGroupsPageFetchSucceededAction(
                    action.courseId,
                    action.assignmentSetId,
                    page.content,
                ),
            );
        }
        yield put(
            overviewGroupsFetchSucceededAction(
                groups,
                action.courseId,
                action.assignmentSetId,
            ),
        );
    } catch (e) {
        yield put(notifyError("Failed to fetch signoff groups"));
    }
}

export default function* overviewSagas() {
    yield takeEvery(
        SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
        getAssignmentSetGroups,
    );
    yield takeEvery(
        SIGN_OFF_OVERVIEW_RESULTS_FETCH_REQUESTED_ACTION,
        getSignOffResults,
    );
}
