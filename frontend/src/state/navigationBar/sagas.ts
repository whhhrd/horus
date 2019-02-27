import { put, takeEvery } from "redux-saga/effects";

import { NAVIGATION_BAR_SET_TAB_REQUESTED_ACTION, NAVIGATION_BAR_SET_MATCH_REQUESTED_ACTION } from "./constants";

import {
    SetActiveNavigationTabAction,
    navigationBarSetTabSucceededAction,
    navigationBarSetMatchSucceededAction,
} from "./actions";

export function* setActiveNavigationBarTab(action: SetActiveNavigationTabAction) {
    yield put(navigationBarSetTabSucceededAction(action.tab));
}

export function* setNavigationBarMatch(action: any) {
    yield put(navigationBarSetMatchSucceededAction(action.match));
}

export default function* navigationBarSagas() {
    yield takeEvery(NAVIGATION_BAR_SET_TAB_REQUESTED_ACTION, setActiveNavigationBarTab);
    yield takeEvery(NAVIGATION_BAR_SET_MATCH_REQUESTED_ACTION, setNavigationBarMatch);
}
