import { authenticatedFetchJSON } from "../../api";
import {
    SignOffResultPatchDto,
    SignOffResultDtoSummary,
} from "../../api/types";
import { put, takeEvery, call, all } from "redux-saga/effects";
import {
    signOffResultsRequestSucceededAction,
    SignOffResultsRequestedAction,
    signOffSaveRequestSucceededAction,
    SignOffHistoryRequestedAction,
    signOffHistoryRequestSucceededAction, signOffHistoryRequestedAction,
} from "./actions";
import { notifyError } from "../notifications/constants";
import {
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_SAVE_REQUESTED_ACTION,
    SIGN_OFF_HISTORY_REQUESTED_ACTION,
} from "./constants";
import {SignOffChangeResult, SignOffChange, SignOffInformation} from "./types";
import { SignOffSaveRequestedAction } from "./actions";
import {select} from "redux-saga/effects";
import {getSignOffHistory} from "./selectors";

export function* requestSignoffs(action: SignOffResultsRequestedAction) {
    try {
        const [signoffs, group, assignmentSet] = yield all([
            call(
                authenticatedFetchJSON,
                "GET",
                `courses/${action.cid}/signoffresults`,
                { groupId: action.gid, assignmentSetId: action.asid },
            ),
            call(authenticatedFetchJSON, "GET", `groups/${action.gid}`),
            call(
                authenticatedFetchJSON,
                "GET",
                `assignmentSets/${action.asid}`,
            ),
        ]);

        yield put(
            signOffResultsRequestSucceededAction(
                signoffs,
                group,
                assignmentSet,
            ),
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* requestSignOffHistory(action: SignOffHistoryRequestedAction) {
    try {
        const result: SignOffResultDtoSummary[] = yield call(
            authenticatedFetchJSON,
            "GET",
            `signoff/history`,
            {
                participantId: action.participantId,
                assignmentId: action.assignmentId,
            },
        );
        yield put(signOffHistoryRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* pushChanges(action: SignOffSaveRequestedAction) {
    const dto: SignOffResultPatchDto = {
        create: [],
        delete: [],
    };

    action.changes.map((change: SignOffChange) => {
        if (change.result === SignOffChangeResult.Unattempted) {
            dto.delete.push({
                comment: change.comment,
                id: change.id!,
            });
        } else {
            dto.create.push({
                assignmentId: change.aid,
                participantId: change.pid,
                comment: change.comment,
                result:
                    change.result === SignOffChangeResult.Sufficient
                        ? "COMPLETE"
                        : "INSUFFICIENT",
            });
        }
    });

    try {
        const signoffs: SignOffResultDtoSummary[] = yield call(
            authenticatedFetchJSON,
            "PATCH",
            `signoff/${action.asid}`,
            undefined,
            dto,
        );
        const deletions = dto.delete.map((c) => c.id);
        yield put(signOffSaveRequestSucceededAction(signoffs, deletions));

        const signOffHistory: (SignOffInformation[] | null) = yield select(getSignOffHistory);
        if (signOffHistory != null && signOffHistory.length > 0) {
            const aid = signOffHistory[0].assignment.id;
            const pid = signOffHistory[0].student.id;
            try {
                yield put(signOffHistoryRequestedAction(pid, aid));
            } catch (f) {
                yield put(notifyError(f.message));
            }
        }
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* signOffSagas() {
    yield takeEvery(SIGN_OFF_RESULTS_REQUESTED_ACTION, requestSignoffs);
    yield takeEvery(SIGN_OFF_SAVE_REQUESTED_ACTION, pushChanges);
    yield takeEvery(SIGN_OFF_HISTORY_REQUESTED_ACTION, requestSignOffHistory);
}
