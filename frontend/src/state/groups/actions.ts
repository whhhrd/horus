import {
    GROUP_SETS_FETCH_REQUESTED_ACTION,
    GROUP_SETS_FETCH_SUCCEEDED_ACTION,

    GROUPS_FETCH_REQUESTED_ACTION,
    GROUPS_FETCH_SUCCEEDED_ACTION,
} from "./constants";

import { Action } from "redux";
import { GroupSetDtoSummary, GroupDtoFull } from "../../api/types";

// GROUP SETS FETCH
export interface GroupSetsFetchAction extends Action<string> {
    readonly courseId: number;
}

export interface GroupSetsFetchSucceededAction extends Action<string> {
    readonly groupSets: GroupSetDtoSummary[];
}

export const groupSetsFetchRequestedAction = (courseId: number) =>
    ({ type: GROUP_SETS_FETCH_REQUESTED_ACTION, courseId });

export const groupSetsFetchSucceededAction = (groupSets: GroupSetDtoSummary[]) =>
    ({ type: GROUP_SETS_FETCH_SUCCEEDED_ACTION, groupSets });

// GROUPS FETCH
export interface GroupsFetchAction extends Action<string> {
    readonly groupSetId: number;
}

export interface GroupsFetchSucceededAction extends Action<string> {
    readonly groups: GroupDtoFull[];
}

export const groupsFetchRequestedAction = (groupSetId: number) =>
    ({ type: GROUPS_FETCH_REQUESTED_ACTION, groupSetId });

export const groupsFetchSucceededAction = (groups: GroupDtoFull[]) =>
    ({ type: GROUPS_FETCH_SUCCEEDED_ACTION, groups });
