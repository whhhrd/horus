export interface AssignmentSetDtoBrief {
    createdAt: Date;
    id: number;
    name: string;
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

type CommentType = "STAFF_ONLY" | "PUBLIC";

export interface CommentThreadDtoBrief {
    id: number;
    type: CommentType;
}

export interface PersonDtoBrief {
    createdAt: Date;
    email: string | null;
    fullName: string;
    id: number;
    loginId: string;
    shortName: string;
}

export interface RoleDtoBrief {
    id: number;
    name: string;
}

export interface ParticipantDtoBrief {
    commentThread: CommentThreadDtoBrief | null;
    courseId: number;
    id: number;
    person: PersonDtoBrief;
    role: RoleDtoBrief;
}

export interface LabelDto {
    color: string;
    id: number;
    name: string;
}

export interface ParticipantDtoFull extends ParticipantDtoBrief {
    createdAt: Date;
    enabled: boolean;
    labels: LabelDto[];
}

export interface AssignmentSetDtoSummary extends AssignmentSetDtoBrief {
    course: CourseDtoBrief;
    createdBy: ParticipantDtoFull;
}

export interface AssignmentDtoBrief {
    commentThreadId: number | null;
    createdAt: Date;
    id: number;
    name: string;
}

export interface GroupSetDtoBrief {
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

export interface AssignmentGroupSetsMappingDto {
    assignmentSet: AssignmentSetDtoBrief;
    groupSet: GroupSetDtoBrief;
}

export interface AssignmentSetDtoFull extends AssignmentSetDtoSummary {
    assignments: AssignmentDtoBrief[];
    groupSetMappings: AssignmentGroupSetsMappingDto[];
}

export interface AssignmentDtoSummary extends AssignmentDtoBrief {
    assignmentSet: AssignmentSetDtoBrief;
    createdBy: ParticipantDtoBrief;
}

type SignOffResultType = "COMPLETE" | "INSUFFICIENT";

export interface SignOffResultDtoSummary {
    assignment: AssignmentDtoBrief;
    commentThread: CommentThreadDtoBrief | null;
    participant: ParticipantDtoFull;
    result: SignOffResultType;
    signedAt: Date;
    signer: ParticipantDtoFull;
}

export interface AssignmentCreateUpdateDto {
    id: number | null;
    name: string;
}

export interface AssignmentSetCreateDto {
    name: string;
}

export interface AssignmentSetUpdateDto {
    assignments: AssignmentCreateUpdateDto[] | null;
    groupSetIds: number[];
    name: string;
}

export interface SignOffResultDtoCompact {
    assignmentId: number;
    commentThreadId: number | null;
    id: number;
    participantId: number;
    result: SignOffResultType;
}

export interface BooleanResultDto {
    result: boolean;
}

export interface CanvasCourseDto {
    canvasId: number;
    courseCode: string;
    name: string;
    startAt: Date | null;
    studentCount: number;
}

export interface CanvasTokenDto {
    token: string;
}

export interface CommentDto {
    content: string;
    createdAt: Date;
    id: number;
    lastEditedAt: Date;
    person: PersonDtoBrief;
    thread: CommentThreadDtoBrief;
}

export interface CommentThreadDtoFull extends CommentThreadDtoBrief {
    comments: CommentDto[];
}

export interface CommentCreateDto {
    content: string;
    threadId: number;
}

export interface CommentThreadCreateDto {
    content: string;
    type: CommentType;
}

export interface CommentThreadUpdateDto {
    type: CommentType;
}

export interface CommentUpdateDto {
    content: string;
}

export interface CourseDtoSummary extends CourseDtoBrief {
    role: RoleDtoBrief;
}

export interface CourseDtoFull extends CourseDtoSummary {
    assignmentSets: AssignmentSetDtoBrief[];
    groupSets: GroupSetDtoBrief[];
    labels: LabelDto[];
}

export interface CourseCreateDto {
    courseCode: string | null;
    externalId: string | null;
    name: string;
}

export interface CourseUpdateDto {
    archivedAt: Date | null;
    courseCode: string | null;
    name: string;
}

export interface GroupDtoBrief {
    archivedAt: Date | null;
    createdAt: Date;
    externalId: string | null;
    id: number;
    name: string;
}

export interface GroupDtoSummary extends GroupDtoBrief {
    commentThread: CommentThreadDtoBrief | null;
    createdBy: ParticipantDtoFull;
    groupSet: GroupSetDtoBrief;
}

export interface GroupDtoFull extends GroupDtoSummary {
    participants: ParticipantDtoBrief[];
}

export interface GroupSetDtoSummary extends GroupSetDtoBrief {
    course: CourseDtoBrief;
    createdBy: PersonDtoBrief;
}

export interface GroupSetDtoFull extends GroupSetDtoSummary {
    assignmentSetMappings: AssignmentGroupSetsMappingDto[];
    groups: GroupDtoBrief[];
}

export interface GroupDtoSearch {
    assignmentSetIds: number[];
    id: number;
    memberNames: string[];
    name: string;
}

export interface GroupAssignmentSetSearchResultDto {
    assignmentSets: AssignmentSetDtoBrief[];
    groups: GroupDtoSearch[];
}

export interface LabelCreateUpdateDto {
    color: string;
    name: string;
}

export interface ParticipantCreateDto {
    personId: number;
    roleId: number;
}

export interface ParticipantUpdateDto {
    commentThreadId: number | null;
    enabled: boolean;
    roleId: number;
}

type HorusResource = "PERSON" | "COURSE" | "COURSE_PARTICIPANT" | "COURSE_LABEL" | "COURSE_PARTICIPANT_LABEL_MAPPING" | "COURSE_GROUPSET" | "COURSE_GROUP" | "COURSE_GROUPMEMBER" | "COURSE_ASSIGNMENTSET" | "COURSE_COMMENT_STAFFONLY" | "COURSE_COMMENT_PUBLIC" | "COURSE_SIGNOFFRESULT";

type HorusResourceScope = "OWN" | "ANY";

type HorusPermissionType = "LIST" | "VIEW" | "CREATE" | "EDIT" | "DELETE";

export interface HorusPermissionDto {
    resource: HorusResource;
    scope: HorusResourceScope;
    type: HorusPermissionType;
}

export interface HorusAuthorityDto {
    courseIds: number[] | null;
    permission: HorusPermissionDto;
}

export interface PersonDtoFull extends PersonDtoBrief {
    authorities: HorusAuthorityDto[];
    participations: ParticipantDtoFull[];
}

export interface SignOffResultCreateDto {
    assignmentId: number;
    comment: string | null;
    participantId: number;
    result: SignOffResultType;
}

export interface SignOffResultArchiveDto {
    comment: string | null;
    id: number;
}

export interface SignOffResultPatchDto {
    create: SignOffResultCreateDto[];
    delete: SignOffResultArchiveDto[];
}

export interface ErrorDto {
    code: string;
    message: string;
    path: string;
}