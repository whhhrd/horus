import {
    AnnouncementDto,
    AcceptDto,
    QueueDto,
    RoomDto,
    RemindDto,
    ParticipantDtoBrief,
} from "../../api/types";

export interface QueueEntry {
    name: string;
    participantId: number;
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
    remind: RemindDto | null;
    participant: ParticipantDtoBrief | null;
    newAnnouncement: AnnouncementDto | null;
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
