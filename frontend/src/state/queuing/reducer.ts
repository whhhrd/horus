import { QueuingState } from "./types";
import {
    UpdateReceivedAction,
    CurrentParticipantReceivedAction,
    RoomQueueLenghtsRequestSucceededAction,
} from "./actions";
import {
    UPDATE_RECEIVED_ACTION,
    HISTORY_SIZE,
    CURRENT_PARTICIPANT_RECEIVED_ACTION,
    ROOM_QUEUE_LENGTHS_REQUESTED_ACTION,
    ROOM_QUEUE_LENGTHS_REQUEST_SUCCEEDED_ACTION,
} from "./constants";
import {
    AcceptDto,
    QueueDto,
    ParticipantDto,
    AddAnnouncementDto,
    AddQueueDto,
    CloseRoomDto,
    DequeueDto,
    EditQueueDto,
    EnqueueDto,
    RemoveQueueDto,
    InitialStateDto,
    RemoveAnnouncementDto,
    AnnouncementDto,
} from "../../api/types";

const initialState: QueuingState = {
    roomQueueLengths: null,
    announcements: [],
    history: [],
    queues: [],
    room: null,
    participant: null,
};
export default function queueReducer(
    state: QueuingState,
    action:
        | UpdateReceivedAction
        | CurrentParticipantReceivedAction
        | RoomQueueLenghtsRequestSucceededAction,
): QueuingState {
    if (state == null) {
        return initialState;
    }
    switch (action.type) {
        case UPDATE_RECEIVED_ACTION:
            switch ((action as UpdateReceivedAction).update.type) {
                case "INITIAL":
                    return initial(state, (action as UpdateReceivedAction)
                        .update as InitialStateDto);
                case "ACCEPT":
                    return accept(state, (action as UpdateReceivedAction)
                        .update as AcceptDto);
                case "ADD_ANNOUNCEMENT":
                    return addAnnouncement(
                        state,
                        (action as UpdateReceivedAction)
                            .update as AddAnnouncementDto,
                    );
                case "REMOVE_ANNOUNCEMENT":
                    return removeAnnouncement(
                        state,
                        (action as UpdateReceivedAction)
                            .update as RemoveAnnouncementDto,
                    );
                case "ADD_QUEUE":
                    return addQueue(state, (action as UpdateReceivedAction)
                        .update as AddQueueDto);
                case "CLOSE_ROOM":
                    return closeRoom(state, (action as UpdateReceivedAction)
                        .update as CloseRoomDto);
                case "DEQUEUE":
                    return dequeue(state, (action as UpdateReceivedAction)
                        .update as DequeueDto);
                case "EDIT_QUEUE":
                    return editQueue(state, (action as UpdateReceivedAction)
                        .update as EditQueueDto);
                case "ENQUEUE":
                    return enqueue(state, (action as UpdateReceivedAction)
                        .update as EnqueueDto);
                case "REMOVE_QUEUE":
                    return removeQueue(state, (action as UpdateReceivedAction)
                        .update as RemoveQueueDto);
                default:
                    return state;
            }
        case CURRENT_PARTICIPANT_RECEIVED_ACTION:
            return {
                ...state,
                participant: (action as CurrentParticipantReceivedAction)
                    .participant,
            };

        case ROOM_QUEUE_LENGTHS_REQUESTED_ACTION:
            return {
                ...state,
                roomQueueLengths: null,
            };
        case ROOM_QUEUE_LENGTHS_REQUEST_SUCCEEDED_ACTION:
            return {
                ...state,
                roomQueueLengths: (action as RoomQueueLenghtsRequestSucceededAction)
                    .queueLengths,
            };
        default:
            return state;
    }
}

function accept(state: QueuingState, acceptDto: AcceptDto) {
    // Add to top of history
    const newHistory = [acceptDto].concat(state.history);
    // Cut of last element if needed
    newHistory.slice(0, HISTORY_SIZE - 1);
    if (
        state.participant != null &&
        state.participant.id === acceptDto.participant.id
    ) {
        return {
            ...state,
            history: newHistory,
        };
    }
    return {
        ...state,
        history: newHistory,
    };
}

function addAnnouncement(
    state: QueuingState,
    addAnnouncementDto: AddAnnouncementDto,
) {
    const newAnnouncements = state.announcements.slice();
    newAnnouncements.push(addAnnouncementDto.announcement);
    return {
        ...state,
        announcements: newAnnouncements,
    };
}

function addQueue(state: QueuingState, addQueueDto: AddQueueDto) {
    const newQueues = state.queues.slice();
    newQueues.push(addQueueDto.queue);
    return {
        ...state,
        queues: newQueues,
    };
}

function closeRoom(state: QueuingState, _: CloseRoomDto) {
    // For now do nothing, until this is more clear
    return state;
}

function dequeue(state: QueuingState, dequeueDto: DequeueDto) {
    // Retrieve the corresponding queue
    const queueIndex = state.queues.findIndex(
        (queue: QueueDto) => queue.id === dequeueDto.queueId,
    );
    // Copy the queue
    const newQueue = { ...state.queues[queueIndex] };
    // Remove from queue
    const newList = state.queues[queueIndex].participants.filter(
        (participant: ParticipantDto) =>
            participant.id !== dequeueDto.participantId,
    );
    // Replace participants list
    newQueue.participants = newList;
    // Add new queue to queue list, replacing old one
    const newQueues = [...state.queues];
    newQueues.splice(queueIndex, 1, newQueue);
    return {
        ...state,
        queues: newQueues,
    };
}

function editQueue(state: QueuingState, editQueueDto: EditQueueDto) {
    // Retrieve the corresponding queue
    const queueIndex = state.queues.findIndex(
        (queue: QueueDto) => queue.id === editQueueDto.queue.id,
    );
    // Replace the queue
    const newQueues = [...state.queues];
    newQueues.splice(queueIndex, 1, editQueueDto.queue);
    return {
        ...state,
        queues: newQueues,
    };
}

function enqueue(state: QueuingState, enqueueDto: EnqueueDto) {
    // Retrieve the corresponding queue
    const queueIndex = state.queues.findIndex(
        (queue: QueueDto) => queue.id === enqueueDto.queueId,
    );
    // Copy the queue
    const newQueue = { ...state.queues[queueIndex] };
    // Retrieve the list
    const newList = [...state.queues[queueIndex].participants];
    // Add to end of the list
    newList.push(enqueueDto.participant);
    // Replace list
    newQueue.participants = newList;
    // Add new queue to queue list, replacing old one
    const newQueues = [...state.queues];
    newQueues.splice(queueIndex, 1, newQueue);
    return {
        ...state,
        queues: newQueues,
    };
}

function removeAnnouncement(
    state: QueuingState,
    removeAnnouncementDto: RemoveAnnouncementDto,
) {
    const newAnnouncements = state.announcements.filter(
        (announcement: AnnouncementDto) =>
            announcement.id !== removeAnnouncementDto.announcementId,
    );
    return {
        ...state,
        announcements: newAnnouncements,
    };
}

function removeQueue(state: QueuingState, removeQueueDto: RemoveQueueDto) {
    const newQueues = state.queues.filter(
        (queue: QueueDto) => queue.id !== removeQueueDto.queueId,
    );
    return {
        ...state,
        queues: newQueues,
    };
}

function initial(state: QueuingState, initialStateDto: InitialStateDto) {
    return {
        ...state,
        ...initialStateDto,
    };
}
