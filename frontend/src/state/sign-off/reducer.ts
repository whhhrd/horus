import { SignOffState } from "./types";
import {
    SignOffResultsRequestSucceededAction,
    SignOffSaveSucceededction,
} from "./actions";
import {
    SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

const initialState: SignOffState = {
    signOffs: null,
};

export default function signOffReducer(
    state: SignOffState,
    action: SignOffResultsRequestSucceededAction | SignOffSaveSucceededction,
): SignOffState {
    if (state == null) {
        return initialState;
    }

    switch (action.type) {
        case SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION:
            const signOffResultRequestSucceededAction = action as SignOffResultsRequestSucceededAction;
            return {
                ...state,
                signOffs: {
                    signOffs: signOffResultRequestSucceededAction.signOffs,
                    group: signOffResultRequestSucceededAction.group,
                    assignmentSet:
                        signOffResultRequestSucceededAction.assignmentSet,
                },
            };
        case SIGN_OFF_RESULTS_REQUESTED_ACTION:
            return {
                ...state,
                signOffs: null,
            };
        case SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION:
            let signOffResults =
                state.signOffs != null ? [...state.signOffs.signOffs] : [];
            const successAction = action as SignOffSaveSucceededction;
            const deletions = successAction.deletions;
            signOffResults.forEach((current) => {
                successAction.signoffs.forEach((updated) => {
                    if (
                        current.assignmentId === updated.assignmentId &&
                        current.participantId === updated.participantId
                    ) {
                        deletions.push(current.id);
                    }
                });
            });
            signOffResults = signOffResults.filter((s) => {
                return successAction.deletions.indexOf(s.id) < 0;
            });
            signOffResults = signOffResults.concat(successAction.signoffs);
            return {
                ...state,
                signOffs: {
                    ...state.signOffs!,
                    signOffs: signOffResults,
                },
            };
        default:
            return state;
    }
}
