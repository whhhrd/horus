import { Action } from "redux";
import {
    UpdateDto,
    ParticipantDtoBrief,
    RoomQueueLengthsDto,
} from "../../api/types";
import {
    UPDATE_RECEIVED_ACTION,
    ACCEPT_REQUESTED_ACTION,
    ACCEPT_NEXT_ACTION,
    ANNOUNCEMENT_CREATED_ACTION,
    ANNOUNCEMENT_REMOVED_ACTION,
    QUEUE_CREATED_ACTION,
    QUEUE_REMOVED_ACTION,
    QUEUE_CHANGED_ACTION,
    ENTER_QUEUE_ACTION,
    DEQUEUE_REQUESTED_ACTION,
    REMIND_REQUESTED_ACTION,
    CURRENT_PARTICIPANT_REQUESTED_ACTION,
    CURRENT_PARTICIPANT_RECEIVED_ACTION,
    DEQUEUE_SELF_REQUESTED_ACTION,
    ROOM_QUEUE_LENGTHS_REQUESTED_ACTION,
    ROOM_QUEUE_LENGTHS_REQUEST_SUCCEEDED_ACTION,
} from "./constants";

export interface UpdateReceivedAction extends Action<string> {
    readonly update: UpdateDto;
}
export const updateReceivedAction = (update: UpdateDto) => ({
    type: UPDATE_RECEIVED_ACTION,
    update,
});

export interface AcceptRequestedAction extends Action<string> {
    readonly cid: number;
    readonly rid: string;
    readonly queueId: string;
    readonly participantId: number;
}
export const acceptRequestedAction = (
    cid: number,
    rid: string,
    queueId: string,
    participantId: number,
) => ({ type: ACCEPT_REQUESTED_ACTION, cid, rid, queueId, participantId });

export interface AnnouncementCreatedAction extends Action<string> {
    readonly rid: string;
    readonly cid: number;
    readonly content: string;
}
export const announcementCreatedAction = (
    rid: string,
    cid: number,
    content: string,
) => ({ type: ANNOUNCEMENT_CREATED_ACTION, rid, cid, content });

export interface QueueCreatedAction extends Action<string> {
    readonly asid: number | null;
    readonly cid: number;
    readonly rid: string;
    readonly name: string;
}
export const queueCreatedAction = (
    asid: number | null,
    cid: number,
    rid: string,
    name: string,
) => ({ type: QUEUE_CREATED_ACTION, asid, cid, rid, name });

export interface DequeueRequestedAction extends Action<string> {
    readonly cid: number;
    readonly rid: string;
    readonly queueId: string;
    readonly participantId: number;
}
export const dequeueRequestedAction = (
    cid: number,
    rid: string,
    queueId: string,
    participantId: number,
) => ({ type: DEQUEUE_REQUESTED_ACTION, cid, rid, queueId, participantId });

export interface QueueChangedAction extends Action<string> {
    readonly queueId: string;
    readonly assignmentSetId: number | null;
    readonly name: string;
}
export const queueChangedAction = (
    queueId: string,
    assignmentSetId: number | null,
    name: string,
) => ({ type: QUEUE_CHANGED_ACTION, queueId, assignmentSetId, name });

export interface EnterQueueAction extends Action<string> {
    readonly cid: number;
    readonly rid: string;
    readonly queueId: string;
}

export const enterQueueAction = (
    cid: number,
    rid: string,
    queueId: string,
) => ({ type: ENTER_QUEUE_ACTION, cid, rid, queueId });

export interface RemindRequestedAction extends Action<string> {
    readonly cid: number;
    readonly rid: string;
    readonly participantId: number;
}
export const remindRequestedAction = (
    cid: number,
    rid: string,
    participantId: number,
) => ({ type: REMIND_REQUESTED_ACTION, cid, rid, participantId });

export interface AnnouncementRemovedAction extends Action<string> {
    readonly cid: number;
    readonly rid: string;
    readonly announcementId: string;
}
export const announcementRemovedAction = (
    cid: number,
    rid: string,
    announcementId: string,
) => ({ type: ANNOUNCEMENT_REMOVED_ACTION, cid, rid, announcementId });

export interface QueueRemovedAction extends Action<string> {
    readonly cid: number;
    readonly rid: string;
    readonly queueId: string;
}
export const queueRemovedAction = (
    cid: number,
    rid: string,
    queueId: string,
) => ({ type: QUEUE_REMOVED_ACTION, cid, rid, queueId });

export interface CurrentParticipantRequestedAction extends Action<string> {
    cid: number;
}

export const currentParticipantRequestedAction = (cid: number) => ({
    type: CURRENT_PARTICIPANT_REQUESTED_ACTION,
    cid,
});

export interface CurrentParticipantReceivedAction extends Action<string> {
    readonly participant: ParticipantDtoBrief;
}

export const currentParticipantReceivedAction = (
    participant: ParticipantDtoBrief,
) => ({ type: CURRENT_PARTICIPANT_RECEIVED_ACTION, participant });

export interface DequeueSelfRequestedAction extends Action<string> {
    cid: number;
    rid: string;
    qid: string;
}
export const dequeueSelfRequestedAction = (
    cid: number,
    rid: string,
    qid: string,
) => ({ type: DEQUEUE_SELF_REQUESTED_ACTION, cid, rid, qid });

export interface AcceptNextAction extends Action<string> {
    cid: number;
    rid: string;
    qid: string;
}

export const acceptNextAction = (cid: number, rid: string, qid: string) => ({
    type: ACCEPT_NEXT_ACTION,
    cid,
    rid,
    qid,
});

// REQUEST QUEUE LENGTHS
export interface RoomQueueLengthsRequestedAction extends Action<string> {
    courseId: number;
}

export interface RoomQueueLenghtsRequestSucceededAction extends Action<string> {
    queueLengths: RoomQueueLengthsDto[];
}

export const roomQueueLengthsRequestedAction = (courseId: number) => ({
    type: ROOM_QUEUE_LENGTHS_REQUESTED_ACTION,
    courseId,
});

export const roomQueueLenghtsRequestSucceededAction = (
    queueLengths: RoomQueueLengthsDto[],
) => ({
    type: ROOM_QUEUE_LENGTHS_REQUEST_SUCCEEDED_ACTION,
    queueLengths,
});
