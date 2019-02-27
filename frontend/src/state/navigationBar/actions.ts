import {
    NAVIGATION_BAR_SET_TAB_REQUESTED_ACTION,
    NAVIGATION_BAR_SET_TAB_SUCCEEDED_ACTION,
    NAVIGATION_BAR_SET_MATCH_REQUESTED_ACTION,
    NAVIGATION_BAR_SET_MATCH_SUCCEEDED_ACTION,
} from "./constants";

import { Action } from "redux";
import { ActiveTabEnum } from "./types";
import { match } from "react-router";

export interface SetActiveNavigationTabAction extends Action<string> {
    readonly tab: ActiveTabEnum;
}

export const navigationBarSetTabRequestedAction = (tab: ActiveTabEnum) =>
    ({ type: NAVIGATION_BAR_SET_TAB_REQUESTED_ACTION, tab });

export const navigationBarSetTabSucceededAction = (tab: ActiveTabEnum) =>
    ({ type: NAVIGATION_BAR_SET_TAB_SUCCEEDED_ACTION, tab });

export const navigationBarSetMatchRequestedAction = (newMatch: match) =>
    ({ type: NAVIGATION_BAR_SET_MATCH_REQUESTED_ACTION, match: newMatch });

export const navigationBarSetMatchSucceededAction = (newMatch: match) =>
    ({ type: NAVIGATION_BAR_SET_MATCH_SUCCEEDED_ACTION, match: newMatch });
