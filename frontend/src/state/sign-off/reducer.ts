import { SignOffState } from "./types";
import {
    SignOffResultsRequestSucceededAction,
    SignOffSaveSucceededction,
    SignOffHistoryRequestSucceededAction,
} from "./actions";
import {
    SIGN_OFF_RESULTS_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_SAVE_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_HISTORY_REQUEST_SUCCEEDED_ACTION,
    SIGN_OFF_HISTORY_REQUESTED_ACTION,
} from "./constants";
import {
    SignOffResultDtoSummary,
    SignOffResultDtoCompact,
} from "../../api/types";

const initialState: SignOffState = {
    signOffs: null,
    signOffHistory: null,
};

export default function signOffReducer(
    state: SignOffState,
    action:
        | SignOffResultsRequestSucceededAction
        | SignOffSaveSucceededction
        | SignOffHistoryRequestSucceededAction,
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
                        current.assignmentId === updated.assignment.id &&
                        current.participantId === updated.participant.id
                    ) {
                        deletions.push(current.id);
                    }
                });
            });

            signOffResults = signOffResults.filter((s) => {
                return successAction.deletions.indexOf(s.id) < 0;
            });

            signOffResults = signOffResults.concat(
                convertToCompact(successAction.signoffs),
            );

            return {
                ...state,
                signOffs: {
                    ...state.signOffs!,
                    signOffs: signOffResults,
                },
            };
        case SIGN_OFF_HISTORY_REQUESTED_ACTION:
            return {
                ...state,
                signOffHistory: null,
            };
        case SIGN_OFF_HISTORY_REQUEST_SUCCEEDED_ACTION:
            const history = (action as SignOffHistoryRequestSucceededAction)
                .signOffHistory;
            return {
                ...state,
                signOffHistory: history,
            };
        default:
            return state;
    }
}

function convertToCompact(signOffs: SignOffResultDtoSummary[]) {
    const result: SignOffResultDtoCompact[] = [];

    signOffs.forEach((s) => {
        const compact: SignOffResultDtoCompact = {
            assignmentId: s.assignment.id,
            commentThreadId:
                s.commentThread != null ? s.commentThread.id : null,
            id: s.id,
            participantId: s.participant.id,
            result: s.result,
        };
        result.push(compact);
    });
    return result;
}
