import {
    AnnouncementDto,
    AcceptDto,
    QueueDto,
    RoomDto,
    ParticipantDtoBrief,
    QueueParticipantDto,
    RoomQueueLengthsDto,
} from "../../api/types";

export interface QueueEntry {
    participant: QueueParticipantDto;
    onAccept?: () => any;
    onDeny?: () => any;
}

export interface HistoryEntry {
    ta: string;
    student: string;
    list: string;
    onRemind: () => any;
}

export interface AnnouncementEntry {
    announcement: string;
    id: string;
    onDelete: () => any;
}
export enum QueuingMode {
    Student,
    TA,
}
export interface QueuingState {
    announcements: AnnouncementDto[];
    history: AcceptDto[];
    queues: QueueDto[];
    room: RoomDto | null;
    participant: ParticipantDtoBrief | null;
    roomQueueLengths: RoomQueueLengthsDto[] | null;
}

export interface AcceptedParticipant {
    participantId: number;
    queueId: string;
}

export enum ConnectionState {
    Connecting,
    Reconnecting,
    Connected,
    Closed,
}
