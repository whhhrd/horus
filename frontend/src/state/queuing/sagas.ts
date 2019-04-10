import { ParticipantDtoBrief, AcceptDto } from "../../api/types";
import { push } from "connected-react-router";
import { authenticatedFetchJSON } from "../../api";
import {
    CurrentParticipantRequestedAction,
    currentParticipantReceivedAction,
    QueueCreatedAction,
    AnnouncementCreatedAction,
    AnnouncementRemovedAction,
    QueueRemovedAction,
    EnterQueueAction,
    DequeueRequestedAction,
    DequeueSelfRequestedAction,
    AcceptRequestedAction,
    RemindRequestedAction,
    AcceptNextAction,
    RoomQueueLengthsRequestedAction,
    roomQueueLenghtsRequestSucceededAction,
    QueueEditRequestedAction,
} from "./actions";
import { put, takeEvery, call } from "redux-saga/effects";
import { notifyError } from "../notifications/constants";
import {
    CURRENT_PARTICIPANT_REQUESTED_ACTION,
    QUEUE_CREATED_ACTION,
    ANNOUNCEMENT_CREATED_ACTION,
    ANNOUNCEMENT_REMOVED_ACTION,
    QUEUE_REMOVED_ACTION,
    ENTER_QUEUE_ACTION,
    DEQUEUE_REQUESTED_ACTION,
    DEQUEUE_SELF_REQUESTED_ACTION,
    ACCEPT_REQUESTED_ACTION,
    REMIND_REQUESTED_ACTION,
    ACCEPT_NEXT_ACTION,
    ROOM_QUEUE_LENGTHS_REQUESTED_ACTION,
    QUEUE_EDIT_REQUESTED_ACTION,
} from "./constants";

export function* getCurrentParticipant(
    action: CurrentParticipantRequestedAction,
) {
    try {
        const participant: ParticipantDtoBrief = yield call(
            authenticatedFetchJSON,
            "GET",
            `courses/${action.cid}/participants/self`,
        );
        yield put(currentParticipantReceivedAction(participant));
    } catch (e) {
        yield put(
            notifyError(
                "An error occured while retrieving your details, try refreshing the page",
            ),
        );
    }
}
export function* createQueue(action: QueueCreatedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "POST",
            `queuing/${action.cid}/rooms/${action.rid}/queues`,
            null,
            {
                name: action.name,
                assignmentSetId: action.asid,
            },
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* editQueue(action: QueueEditRequestedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "PUT",
            `queuing/${action.courseId}/rooms/${action.roomCode}/queues/${action.queueId}`,
            null,
            action.queueUpdate,
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* createAnnouncement(action: AnnouncementCreatedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "POST",
            `queuing/${action.cid}/rooms/${action.rid}/announcements`,
            null,
            {
                content: action.content,
            },
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* removeAnnouncement(action: AnnouncementRemovedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `queuing/${action.cid}/rooms/${action.rid}/announcements/${
                action.announcementId
            }`,
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* removeQueue(action: QueueRemovedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `queuing/${action.cid}/rooms/${action.rid}/queues/${
                action.queueId
            }`,
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* enqueue(action: EnterQueueAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "POST",
            `queuing/${action.cid}/rooms/${action.rid}/queues/${
                action.queueId
            }/participants/self`,
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* dequeue(action: DequeueRequestedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `queuing/${action.cid}/rooms/${action.rid}/queues/${
                action.queueId
            }/participants/${action.participantId}`,
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* dequeueSelf(action: DequeueSelfRequestedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "DELETE",
            `queuing/${action.cid}/rooms/${action.rid}/queues/${
                action.qid
            }/participants/self`,
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* accept(action: AcceptRequestedAction) {
    try {
        const result: AcceptDto = yield call(
            authenticatedFetchJSON,
            "POST",
            `queuing/${action.cid}/rooms/${action.rid}/queues/${
                action.queueId
            }/participants/${action.participantId}/accept`,
        );

        if (
            result.groupId != null &&
            result.assignmentSetId != null &&
            result.participant.id != null
        ) {
            yield put(
                push(
                    `../../${action.cid}/signoff?as=${
                        result.assignmentSetId
                    }&g=${result.groupId}&r=${action.rid}&pid=${
                        result.participant.id
                    }`,
                ),
            );
        }
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* remind(action: RemindRequestedAction) {
    try {
        yield call(
            authenticatedFetchJSON,
            "POST",
            `queuing/${action.cid}/rooms/${action.rid}/participants/${
                action.participantId
            }/remind`,
        );
    } catch (e) {
        yield put(notifyError(e.message));
    }
}
export function* acceptNext(action: AcceptNextAction) {
    try {
        const result: AcceptDto = yield call(
            authenticatedFetchJSON,
            "POST",
            `queuing/${action.cid}/rooms/${action.rid}/queues/${
                action.qid
            }/participants/next/accept`,
        );

        if (
            result.groupId != null &&
            result.assignmentSetId != null &&
            result.participant.id != null
        ) {
            yield put(
                push(
                    `../../${action.cid}/signoff?as=${
                        result.assignmentSetId
                    }&g=${result.groupId}&r=${action.rid}&pid=${
                        result.participant.id
                    }`,
                ),
            );
        }
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export function* fetchRoomQueueLengths(action: RoomQueueLengthsRequestedAction) {
    try {
        const result = yield call(
            authenticatedFetchJSON,
            "GET",
            `queuing/${action.courseId}/queues`,
        );
        yield put(roomQueueLenghtsRequestSucceededAction(result));
    } catch (e) {
        yield put(notifyError(e.message));
    }
}

export default function* queuingSagas() {
    yield takeEvery(
        CURRENT_PARTICIPANT_REQUESTED_ACTION,
        getCurrentParticipant,
    );
    yield takeEvery(QUEUE_CREATED_ACTION, createQueue);
    yield takeEvery(ANNOUNCEMENT_CREATED_ACTION, createAnnouncement);
    yield takeEvery(ANNOUNCEMENT_REMOVED_ACTION, removeAnnouncement);
    yield takeEvery(QUEUE_REMOVED_ACTION, removeQueue);
    yield takeEvery(ENTER_QUEUE_ACTION, enqueue);
    yield takeEvery(DEQUEUE_REQUESTED_ACTION, dequeue);
    yield takeEvery(DEQUEUE_SELF_REQUESTED_ACTION, dequeueSelf);
    yield takeEvery(ACCEPT_REQUESTED_ACTION, accept);
    yield takeEvery(REMIND_REQUESTED_ACTION, remind);
    yield takeEvery(ACCEPT_NEXT_ACTION, acceptNext);
    yield takeEvery(ROOM_QUEUE_LENGTHS_REQUESTED_ACTION, fetchRoomQueueLengths);
    yield takeEvery(QUEUE_EDIT_REQUESTED_ACTION, editQueue);
}
