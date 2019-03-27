import {
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION,
    SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION,
} from "./constants";

import { SignOffResultDtoCompact, GroupDtoFull } from "../../api/types";
import { Action } from "redux";

export const overviewSignOffResultsRequestedAction = (
    courseId: number,
    assignmentSetId: number,
) => ({
    type: SIGN_OFF_OVERVIEW_RESULTS_FETCH_REQUESTED_ACTION,
    courseId,
    assignmentSetId,
});

export const overviewSignOffResultsRequestSucceededAction = (
    results: SignOffResultDtoCompact[],
    courseId: number,
    assignmentSetId: number,
) => ({
    type: SIGN_OFF_OVERVIEW_RESULTS_FETCH_SUCCEEDED_ACTION,
    courseId,
    assignmentSetId,
    results,
});

export const overviewGroupsFetchRequestedAction = (
    courseId: number,
    assignmentSetId: number,
) => ({
    type: SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
    courseId,
    assignmentSetId,
});

export const overviewGroupsPageFetchSucceededAction = (
    courseId: number,
    assignmentSetId: number,
    groups: GroupDtoFull[],
) => ({
    type: SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION,
    courseId,
    assignmentSetId,
    groups,
});

export const overviewGroupsFetchSucceededAction = (
    groups: GroupDtoFull[],
    courseId: number,
    assignmentSetId: number,
) => ({
    type: SIGN_OFF_OVERVIEW_GROUPS_FETCH_SUCCEEDED_ACTION,
    courseId,
    assignmentSetId,
    groups,
});

export interface SignOffOverviewFilterQueryAction extends Action<string> {
    courseId: number;
    operator: string;
    assignmentSetId?: number;
    labelIds?: number[];
    groupSetId?: number;
}

export interface SignOffOverviewFilterSucceededAction extends Action<string> {
    groups: GroupDtoFull[];
    finished?: boolean;
}

export const signOffOverviewFilterQueryAction = (
    courseId: number,
    operator: string,
    assignmentSetId?: number,
    labelIds?: number[],
    groupSetId?: number,
) => ({
    type: SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION,
    courseId,
    operator,
    assignmentSetId,
    groupSetId,
    labelIds,
});

export const signOffOverviewFilterSucceededAction = (
    groups: GroupDtoFull[],
    finished?: boolean,
) => ({
    type: SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION,
    groups,
    finished,
});
