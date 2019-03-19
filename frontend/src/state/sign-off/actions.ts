import {
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_HISTORY_REQUESTED_ACTION,
    SIGN_OFF_HISTORY_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

import {
    SignOffResultDtoCompact,
    GroupDtoFull,
    AssignmentSetDtoFull,
    SignOffResultDtoSummary,
} from "../../api/types";
import { Action } from "redux";
import { SignOffDetails, SignOffChange } from "./types";
import { SIGN_OFF_SAVE_REQUESTED_ACTION } from "./constants";

// SIGN-OFF HISTORY
export interface SignOffHistoryRequestedAction extends Action<string> {
    participantId: number;
    assignmentId: number;
}

export interface SignOffHistoryRequestSucceededAction extends Action<string> {
    signOffHistory: SignOffResultDtoSummary[];
}

export const signOffHistoryRequestedAction = (
    participantId: number,
    assignmentId: number,
) => ({
    type: SIGN_OFF_HISTORY_REQUESTED_ACTION,
    participantId,
    assignmentId,
});

export const signOffHistoryRequestSucceededAction = (
    signOffHistory: SignOffResultDtoSummary[],
) => ({
    type: SIGN_OFF_HISTORY_REQUEST_SUCCEEDED_ACTION,
    signOffHistory,
});

// SIGN-OFF RESULTS
export interface SignOffResultsRequestedAction extends Action<string> {
    readonly asid: number;
    readonly cid: number;
    readonly gid: number;
}

export interface SignOffResultsRequestSucceededAction
    extends Action<string>,
        SignOffDetails {
    signoffs: SignOffResultDtoCompact[];
    group: GroupDtoFull;
    assignmentSet: AssignmentSetDtoFull;
}

export const signOffResultsRequestedAction = (
    asid: number,
    cid: number,
    gid: number,
) => ({ type: SIGN_OFF_RESULTS_REQUESTED_ACTION, asid, cid, gid });

export const signOffResultsRequestSucceededAction = (
    signOffs: SignOffResultDtoCompact[],
    group: GroupDtoFull,
    assignmentSet: AssignmentSetDtoFull,
) => ({
    type: SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    signOffs,
    group,
    assignmentSet,
});

// SIGN-OFF SAVE
export interface SignOffSaveRequestedAction extends Action<string> {
    changes: SignOffChange[];
    asid: number;
}
export interface SignOffSaveSucceededction extends Action<string> {
    signoffs: SignOffResultDtoSummary[];
    deletions: number[];
}
export const signOffSaveRequestedAction = (
    changes: SignOffChange[],
    asid: number,
) => ({ type: SIGN_OFF_SAVE_REQUESTED_ACTION, changes, asid });

export const signOffSaveRequestSucceededAction = (
    signoffs: SignOffResultDtoSummary[],
    deletions: number[],
) => ({ type: SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION, signoffs, deletions });
