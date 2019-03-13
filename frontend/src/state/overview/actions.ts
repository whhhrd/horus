import {
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_RESULTS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_REQUESTED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_FETCH_SUCCEEDED_ACTION,
    SIGN_OFF_OVERVIEW_GROUPS_PAGE_FETCH_SUCCEEDED_ACTION,
} from "./constants";

import { SignOffResultDtoCompact, GroupDtoFull } from "../../api/types";

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
