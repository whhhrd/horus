interface PersonDtoBrief {
    createdAt: Date;
    email: string | null;
    fullName: string;
    id: number;
    loginId: string;
    shortName: string;
}

type CommentType = "STAFF_ONLY" | "PUBLIC";

interface CommentThreadDtoBrief {
    id: number;
    type: CommentType;
}

interface RoleDtoBrief {
    id: number;
    name: string;
}

interface ParticipantDto {
    commentThread: CommentThreadDtoBrief | null;
    courseCode: number;
    createdAt: Date;
    enabled: boolean;
    id: number;
    person: PersonDtoBrief;
    role: RoleDtoBrief;
}

interface PersonDtoFull extends PersonDtoBrief {
    participations: ParticipantDto[];
}

interface GroupDtoBrief {
    archivedAt: Date | null;
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

interface GroupSetDtoBrief {
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

interface GroupDtoSummary extends GroupDtoBrief {
    commentThread: CommentThreadDtoBrief | null;
    createdBy: ParticipantDto;
    groupSet: GroupSetDtoBrief;
}

interface GroupDtoFull extends GroupDtoSummary {
    participants: ParticipantDto[];
}

interface CourseDtoBrief {
    archived: boolean;
    archivedAt: Date | null;
    courseCode: string | null;
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

interface GroupSetDtoSummary extends GroupSetDtoBrief {
    course: CourseDtoBrief;
    createdBy: PersonDtoBrief;
}

interface GroupSetDtoFull extends GroupSetDtoSummary {
    groups: GroupDtoBrief[];
}

interface AssignmentDtoBrief {
    createdAt: Date;
    id: number;
    name: string;
    orderKey: string;
}

interface AssignmentSetDtoBrief {
    createdAt: Date;
    id: number;
    name: string;
}

interface AssignmentDtoSummary extends AssignmentDtoBrief {
    assignmentSet: AssignmentSetDtoBrief;
    commentThread: CommentThreadDtoBrief | null;
    createdBy: ParticipantDto;
}

interface AssignmentSetDtoSummary extends AssignmentSetDtoBrief {
    course: CourseDtoBrief;
    createdBy: ParticipantDto;
}

type SignOffResult = "COMPLETE" | "INCOMPLETE";

interface SignOffResultDtoSummary {
    assignment: AssignmentDtoBrief;
    commentThread: CommentThreadDtoBrief | null;
    participant: ParticipantDto;
    result: SignOffResult;
    signedAt: Date;
    signer: ParticipantDto;
}

interface CommentDto {
    content: string;
    createdAt: Date;
    id: number;
    lastEditedAt: Date;
    person: PersonDtoBrief;
    thread: CommentThreadDtoBrief;
}