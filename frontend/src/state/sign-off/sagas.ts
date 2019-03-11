import { authenticatedFetchJSON } from "../../api";
import { SignOffResultDtoCompact, SignOffResultPatchDto } from "../../api/types";
import { put, takeEvery, call, all } from "redux-saga/effects";
import {
    signOffResultsRequestSucceededAction,
    SignOffResultsRequestedAction,
    signOffSaveRequestSucceededAction,
} from "./actions";
import { notifyError } from "../notifications/constants";
import {
    SIGN_OFF_RESULTS_REQUESTED_ACTION,
    SIGN_OFF_SAVE_REQUESTED_ACTION,
} from "./constants";
import { SignOffChangeResult, SignOffChange } from "./types";
import { SignOffSaveRequestedAction } from "./actions";

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
        yield put(notifyError("Failed to fetch signoffs"));
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
        const signoffs: SignOffResultDtoCompact[] = yield call(
            authenticatedFetchJSON,
            "PATCH",
            `signoff/${action.asid}`,
            undefined,
            dto,
        );
        const deletions = dto.delete.map((c) => c.id);
        yield put(signOffSaveRequestSucceededAction(signoffs, deletions));
    } catch (e) {
        yield put(notifyError("Saving signoff changes failed"));
    }
}

export default function* signOffSagas() {
    yield takeEvery(SIGN_OFF_RESULTS_REQUESTED_ACTION, requestSignoffs);
    yield takeEvery(SIGN_OFF_SAVE_REQUESTED_ACTION, pushChanges);
}
