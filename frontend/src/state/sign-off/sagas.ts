import { authenticatedFetchJSON } from "../../api";
import { SignOffResultDtoCompact, AssignmentSetDtoFull, GroupDtoFull, SignOffResultPatchDto } from "../types";
import { put, takeEvery, call } from "redux-saga/effects";
import {
    signOffResultsRequestSucceededAction,
    SignOffResultsRequestedAction,
    signOffSaveRequestSucceededAction,
    SignOffSaveRequestedAction,
} from "./actions";
import { notifyError, notifySuccess } from "../notifications/constants";
import { SIGN_OFF_RESULTS_REQUESTED_ACTION, SIGN_OFF_SAVE_REQUESTED_ACTION } from "./constants";
import { SignOffChange, SignOff } from "./types";

export function* requestSignoffs(action: SignOffResultsRequestedAction) {
    try {
        const signoffs: SignOffResultDtoCompact[] = yield call(authenticatedFetchJSON, "GET",
            `courses/${action.cid}/signoffresults`, { groupId: action.gid, assignmentSetId: action.asid });
        const group: GroupDtoFull = yield call(authenticatedFetchJSON, "GET", `groups/${action.gid}`);
        const assignmentSet: AssignmentSetDtoFull = yield call(authenticatedFetchJSON, "GET",
            `assignmentSets/${action.asid}`);
        yield put(signOffResultsRequestSucceededAction(signoffs, group, assignmentSet));
    } catch (e) {
        yield put(notifyError("Failed to fetch signoffs"));
    }
}

export function* pushChanges(action: SignOffSaveRequestedAction) {
    const changes: SignOffResultPatchDto = {
        create: [],
        delete: [],
    };
    action.changes.map((change: SignOffChange) => {
        if (change.result === SignOff.Unattempted) {
            changes.delete.push({
                comment: null,
                id: change.remoteId,
            });
        } else {
            changes.create.push({
                assignmentId: change.aid,
                participantId: change.pid,
                comment: null,
                result: change.result === SignOff.Complete ? "COMPLETE" : "INSUFFICIENT",
            });
        }
    });
    try {
        yield call(authenticatedFetchJSON, "PATCH", `signoff/${action.asid}`, undefined, changes);
        yield put(notifySuccess("Changes saved successfully"));
        yield put(signOffSaveRequestSucceededAction());
    } catch (e) {
        yield put(notifyError("Saving signoff changes failed"));
    }
}

export default function* signOffSagas() {
    yield takeEvery(SIGN_OFF_RESULTS_REQUESTED_ACTION, requestSignoffs);
    yield takeEvery(SIGN_OFF_SAVE_REQUESTED_ACTION, pushChanges);
}
