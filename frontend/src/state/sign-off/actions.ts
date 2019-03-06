import {
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    CHANGE_LOCAL_SIGNOFF_ACTION,
    SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_SAVE_REQUESTED_ACTION,
} from "./constants";
import { SignOffResultDtoCompact, GroupDtoFull, AssignmentSetDtoFull } from "../types";
import { Action } from "redux";
import { SignOffDetails, SignOff, SignOffChange } from "./types";

export interface SignOffResultsRequestedAction extends Action<string> {
    readonly asid: number;
    readonly cid: number;
    readonly gid: number;
}
export type SignOffResultsRequestSucceededAction = Action<string> & SignOffDetails;

export type ChangeLocalSignoffAction = Action<string> & SignOffChange;

export interface SignOffSaveRequestedAction extends Action<string> {
    changes: SignOffChange[];
    asid: number;
}
export const signOffResultsRequestedAction = (asid: number, cid: number, gid: number) => ({
    type: SIGN_OFF_RESULTS_REQUESTED_ACTION,
    asid,
    cid,
    gid,
});
export const signOffResultsRequestSucceededAction = (signOffs: SignOffResultDtoCompact[],
                                                     group: GroupDtoFull,
                                                     assignmentSet: AssignmentSetDtoFull) =>
    ({ type: SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION, signOffs, group, assignmentSet });

export const changeLocalSignoffAction = (aid: number, pid: number, result: SignOff) =>
    ({ type: CHANGE_LOCAL_SIGNOFF_ACTION, aid, pid, result });
export const signOffSaveRequestedAction = (changes: SignOffChange[], asid: number) => (
    { type: SIGN_OFF_SAVE_REQUESTED_ACTION, changes, asid });
export const signOffSaveRequestSucceededAction = () => ({ type: SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION });
