export interface PersonDtoBrief {
    createdAt: Date;
    email: string | null;
    fullName: string;
    id: number;
    loginId: string;
    shortName: string;
}

type CommentType = "STAFF_ONLY" | "PUBLIC";

export interface CommentThreadDtoBrief {
    id: number;
    type: CommentType;
}

export interface RoleDtoBrief {
    id: number;
    name: string;
}

export interface ParticipantDto {
    commentThread: CommentThreadDtoBrief | null;
    courseCode: number;
    createdAt: Date;
    enabled: boolean;
    id: number;
    person: PersonDtoBrief;
    role: RoleDtoBrief;
}

export interface PersonDtoFull extends PersonDtoBrief {
    participations: ParticipantDto[];
}

export interface GroupDtoBrief {
    archivedAt: Date | null;
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

export interface GroupSetDtoBrief {
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

export interface GroupDtoSummary extends GroupDtoBrief {
    commentThread: CommentThreadDtoBrief | null;
    createdBy: ParticipantDto;
    groupSet: GroupSetDtoBrief;
}

export interface GroupDtoFull extends GroupDtoSummary {
    participants: ParticipantDto[];
}

export interface CourseDtoBrief {
    archived: boolean;
    archivedAt: Date | null;
    courseCode: string | null;
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

export interface GroupSetDtoSummary extends GroupSetDtoBrief {
    course: CourseDtoBrief;
    createdBy: PersonDtoBrief;
}

export interface GroupSetDtoFull extends GroupSetDtoSummary {
    groups: GroupDtoBrief[];
}

export interface AssignmentDtoBrief {
    createdAt: Date;
    id: number;
    name: string;
    orderKey: string;
}

export interface AssignmentSetDtoBrief {
    createdAt: Date;
    id: number;
    name: string;
}

export interface AssignmentDtoSummary extends AssignmentDtoBrief {
    assignmentSet: AssignmentSetDtoBrief;
    commentThread: CommentThreadDtoBrief | null;
    createdBy: ParticipantDto;
}

export interface AssignmentSetDtoSummary extends AssignmentSetDtoBrief {
    course: CourseDtoBrief;
    createdBy: ParticipantDto;
}

type SignOffResult = "COMPLETE" | "INCOMPLETE";

export interface SignOffResultDtoSummary {
    assignment: AssignmentDtoBrief;
    commentThread: CommentThreadDtoBrief | null;
    participant: ParticipantDto;
    result: SignOffResult;
    signedAt: Date;
    signer: ParticipantDto;
}

export interface CommentDto {
    content: string;
    createdAt: Date;
    id: number;
    lastEditedAt: Date;
    person: PersonDtoBrief;
    thread: CommentThreadDtoBrief;
}

export interface CourseDtoSummary extends CourseDtoBrief {
    role: RoleDtoBrief;
}