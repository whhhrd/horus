import {
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

import {
    SignOffResultDtoCompact,
    GroupDtoFull,
    AssignmentSetDtoFull,
} from "../../api/types";
import { Action } from "redux";
import { SignOffDetails, SignOffChange } from "./types";
import { SIGN_OFF_SAVE_REQUESTED_ACTION } from "./constants";

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

export interface SignOffSaveRequestedAction extends Action<string> {
    changes: SignOffChange[];
    asid: number;
}
export interface SignOffSaveSucceededction extends Action<string> {
    signoffs: SignOffResultDtoCompact[];
    deletions: number[];
}
export const signOffSaveRequestedAction = (
    changes: SignOffChange[],
    asid: number,
) => ({ type: SIGN_OFF_SAVE_REQUESTED_ACTION, changes, asid });

export const signOffSaveRequestSucceededAction = (
    signoffs: SignOffResultDtoCompact[],
    deletions: number[],
) => ({ type: SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION, signoffs, deletions });
