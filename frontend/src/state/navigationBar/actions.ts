import { NAVIGATION_BAR_SET_TAB_ACTION } from "./constants";

import { Action } from "redux";
import { ActiveTabEnum } from "./types";

export interface SetActiveNavigationTabAction extends Action<string> {
    readonly tab: ActiveTabEnum;
}

export const navigationBarSetTabAction = (tab: ActiveTabEnum) => ({
    type: NAVIGATION_BAR_SET_TAB_ACTION,
    tab,
});
