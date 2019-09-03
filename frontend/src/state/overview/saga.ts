import {
    SignOffOverviewFetchRequestedAction,
    SignOffOverviewResultsFetchRequestedAction,
} from "./types";
import { notifyError } from "../notifications/constants";
import { put, takeLatest, call } from "redux-saga/effects";
import { authenticatedFetchJSON } from "../../api";
import { SpringPage } from "../../api/spring-types";
import { GroupDtoFull, SignOffResultDtoCompact } from "../../api/types";
import {
    overviewGroupsPageFetchSucceededAction,
    overviewGroupsFetchSucceededAction,
    overviewSignOffResultsRequestSucceededAction,
    SignOffOverviewFilterQueryAction,
    signOffOverviewFilterSucceededAction,
} from "./actions";
import {
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION,
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
        yield put(notifyError(e.message));
    }
}

function* getAssignmentSetGroups(action: SignOffOverviewFetchRequestedAction) {
    try {
        const groups: GroupDtoFull[] = [];
        let page: SpringPage<GroupDtoFull> = yield call(
            authenticatedFetchJSON,
            "GET",
            `assignmentSets/${action.assignmentSetId}/groups`,
            { sort: "groupSet.id,id" },
        );
        groups.push(...page.content);
        yield put(
            overviewGroupsPageFetchSucceededAction(
                action.courseId,
                action.assignmentSetId,
                page.content,
                page.totalPages,
                page.number,
            ),
        );
        while (!page.last) {
            page = yield call(
                authenticatedFetchJSON,
                "GET",
                `assignmentSets/${action.assignmentSetId}/groups`,
                { sort: "groupSet.id,id", page: page.number + 1 },
            );
            groups.push(...page.content);
            yield put(
                overviewGroupsPageFetchSucceededAction(
                    action.courseId,
                    action.assignmentSetId,
                    page.content,
                    page.totalPages,
                    page.number,
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
        yield put(notifyError(e.message));
    }
}

export function* signOffOverviewFilterQuery(
    action: SignOffOverviewFilterQueryAction,
) {
    const {
        courseId,
        groupSetId,
        assignmentSetId,
        labelIds,
        operator,
        query,
    } = action;
    const queryParams = {
        sort: "groupSet.id,id",
        groupSetId,
        assignmentSetId,
        labelIds,
        operator,
        query,
    };
    try {
        let page: SpringPage<GroupDtoFull> = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${courseId}/groups/filtered`,
            queryParams,
        );
        yield put(signOffOverviewFilterSucceededAction(page.content, page.totalPages, page.number, page.last));
        while (!page.last) {
            page = yield call(
                authenticatedFetchJSON,
                "GET",
                `courses/${courseId}/groups/filtered`,
                {
                    ...queryParams,
                    page: page.number + 1,
                },
            );
            yield put(signOffOverviewFilterSucceededAction(page.content, page.totalPages, page.number, page.last));
        }
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* overviewSagas() {
    yield takeLatest(
        SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
        getAssignmentSetGroups,
    );
    yield takeLatest(
        SIGN_OFF_OVERVIEW_RESULTS_FETCH_REQUESTED_ACTION,
        getSignOffResults,
    );
    yield takeLatest(
        SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION,
        signOffOverviewFilterQuery,
    );
}
