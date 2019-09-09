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
    totalPages: number,
    pageNumber: number,
) => ({
    type: SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION,
    courseId,
    assignmentSetId,
    groups,
    totalPages,
    pageNumber,
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
    query?: string;
}

export interface SignOffOverviewFilterSucceededAction extends Action<string> {
    groups: GroupDtoFull[];
    finished?: boolean;
    totalPages: number;
    pageNumber: number;
}

export const signOffOverviewFilterQueryAction = (
    courseId: number,
    operator: string,
    assignmentSetId?: number,
    labelIds?: number[],
    groupSetId?: number,
    query?: string,
) => ({
    type: SIGN_OFF_OVERVIEW_FILTER_QUERY_ACTION,
    courseId,
    operator,
    assignmentSetId,
    groupSetId,
    labelIds,
    query,
});

export const signOffOverviewFilterSucceededAction = (
    groups: GroupDtoFull[],
    totalPages: number,
    pageNumber: number,
    finished?: boolean,
) => ({
    type: SIGN_OFF_OVERVIEW_FILTER_SUCCEEDED_ACTION,
    groups,
    finished,
    totalPages,
    pageNumber,
});
