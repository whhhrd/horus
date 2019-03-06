import { SignOffState, SignOffChange, SignOff } from "./types";
import { SignOffResultsRequestSucceededAction, ChangeLocalSignoffAction } from "./actions";
import {
    SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    CHANGE_LOCAL_SIGNOFF_ACTION,
    SIGN_OFF_SAVE_REQUESTED_ACTION,
    SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import { Action } from "redux";
import { SignOffResultDtoCompact } from "../types";

const initialState: SignOffState = {
    localChanges: [],
    saving: false,
};

export default function signOffReducer(state: SignOffState, action: Action): SignOffState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION:
            const signOffResultRequestSucceededAction = action as SignOffResultsRequestSucceededAction;
            return {
                ...state,
                localChanges: [],
                remoteResults: {
                    signOffs: signOffResultRequestSucceededAction.signOffs,
                    group: signOffResultRequestSucceededAction.group,
                    assignmentSet: signOffResultRequestSucceededAction.assignmentSet,
                },
            };
        case CHANGE_LOCAL_SIGNOFF_ACTION:
            const localSignOffAction = action as ChangeLocalSignoffAction;
            const newState = state.localChanges!.filter((signOffChange: SignOffChange) => (
                signOffChange.aid !== localSignOffAction.aid || signOffChange.pid !== localSignOffAction.pid
            ));
            if (changed(state, localSignOffAction)) {
                if (localSignOffAction.result === SignOff.Unattempted) {
                    localSignOffAction.remoteId = state.remoteResults!.signOffs.find(
                        (signOff: SignOffResultDtoCompact) => (
                            signOff.assignmentId === localSignOffAction.aid
                            && signOff.participantId === localSignOffAction.pid
                        ))!.id;
                }
                newState.push(localSignOffAction);
            }
            return {
                ...state,
                localChanges: newState,
            };
        case SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                saving: false,
            };
        case SIGN_OFF_SAVE_REQUESTED_ACTION:
            return {
                ...state,
                saving: true,
            };
        default:
            return state;
    }
}
const changed = (state: SignOffState, action: ChangeLocalSignoffAction) => {
    const remoteSignOffState = state.remoteResults!.signOffs.find((signOff: SignOffResultDtoCompact) => (
        signOff.assignmentId === action.aid && signOff.participantId === action.pid
    ));
    if (remoteSignOffState === undefined) {
        return action.result !== SignOff.Unattempted;
    }
    return !(remoteSignOffState.result === "COMPLETE" && action.result === SignOff.Complete) &&
        !(remoteSignOffState.result === "INSUFFICIENT" && action.result === SignOff.Incomplete);
};
