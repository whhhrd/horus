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

export type CommentType = "STAFF_ONLY" | "PUBLIC";

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

export interface AssignmentSetDtoSummary extends AssignmentSetDtoBrief {
    course: CourseDtoBrief;
    createdBy: ParticipantDtoBrief;
}

export interface AssignmentDtoBrief {
    commentThreadId: number | null;
    createdAt: Date;
    id: number;
    milestone: boolean;
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

export type SignOffResultType = "COMPLETE" | "INSUFFICIENT";

export interface SignOffResultDtoSummary {
    archivedAt: Date | null;
    archivedBy: ParticipantDtoBrief | null;
    assignment: AssignmentDtoBrief;
    commentThread: CommentThreadDtoBrief | null;
    id: number;
    participant: ParticipantDtoBrief;
    result: SignOffResultType;
    signedAt: Date;
    signer: ParticipantDtoBrief;
}

export interface AssignmentCreateUpdateDto {
    id: number | null;
    milestone: boolean;
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

export interface SupplementaryRoleCreateUpdateDto {
    name: string;
    permissions: string[];
}

export interface ParticipantSupplementaryRoleMappingDto {
    assignedAt: Date;
    assignedBy: ParticipantDtoBrief;
    participantId: number;
    roleId: number;
}

export interface SupplementaryRoleDto {
    id: number;
    name: string;
    permissions: string[];
}

export interface BooleanDto {
    value: boolean;
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
    hidden: boolean;
    role: RoleDtoBrief;
}

export interface LabelDto {
    color: string;
    id: number;
    name: string;
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
    createdBy: ParticipantDtoBrief;
    groupSet: GroupSetDtoBrief;
}

export interface GroupDtoFull extends GroupDtoSummary {
    participants: ParticipantDtoBrief[];
}

export interface SignOffResultDtoStudent {
    assignmentId: number;
    participantId: number;
    result: SignOffResultType;
    signedAt: Date;
    signerName: string;
}

export interface StudentDashboardDto {
    assignmentSets: AssignmentSetDtoFull[];
    groups: GroupDtoFull[];
    results: SignOffResultDtoStudent[];
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

export type BatchJobStatus = "CREATED" | "PROCESSING" | "COMPLETED" | "ABORTED";

export interface BatchJobDto {
    completedTasks: number;
    description: string;
    error: string | null;
    id: string;
    issuer: PersonDtoBrief;
    startedAt: Date;
    status: BatchJobStatus;
    totalTasks: number;
}

export interface LabelCreateUpdateDto {
    color: string;
    name: string;
}

export interface ParticipantDtoFull extends ParticipantDtoBrief {
    createdAt: Date;
    enabled: boolean;
    labels: LabelDto[];
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

export type HorusResource = "PERSON" | "COURSE" | "COURSE_PARTICIPANT" | "COURSE_SUPPLEMENTARY_ROLE" | "COURSE_SUPPLEMENTARY_ROLE_MAPPING" | "COURSE_LABEL" | "COURSE_PARTICIPANT_LABEL_MAPPING" | "COURSE_GROUPSET" | "COURSE_GROUP" | "COURSE_GROUPMEMBER" | "COURSE_ASSIGNMENTSET" | "COURSE_COMMENT_STAFFONLY" | "COURSE_COMMENT_PUBLIC" | "COURSE_SIGNOFFRESULT";

export type HorusResourceScope = "OWN" | "ANY";

export type HorusPermissionType = "LIST" | "VIEW" | "CREATE" | "EDIT" | "DELETE";

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

export interface RoomDto {
    code: string;
    courseId: number;
    name: string;
}

export interface ParticipantDto {
    fullName: string;
    id: number;
}

export interface QueueParticipantDto extends ParticipantDto {
    addedAt: Date;
}

export interface QueueDto {
    assignmentSetId: number | null;
    courseId: number;
    createdAt: Date;
    id: string;
    name: string;
    participants: QueueParticipantDto[];
    roomCode: string;
}

export type UpdateType = "INITIAL" | "ENQUEUE" | "DEQUEUE" | "ADD_QUEUE" | "EDIT_QUEUE" | "REMOVE_QUEUE" | "CLOSE_ROOM" | "ADD_ANNOUNCEMENT" | "REMOVE_ANNOUNCEMENT" | "REMIND" | "ACCEPT";

export interface UpdateDto {
    roomCode: string;
    type: UpdateType;
}

export interface AcceptDto extends UpdateDto {
    accepter: ParticipantDto;
    assignmentSetId: number | null;
    groupId: number | null;
    participant: QueueParticipantDto;
    queueId: string;
}

export interface AnnouncementDto {
    content: string;
    id: string;
    roomCode: string;
}

export interface AddAnnouncementDto extends UpdateDto {
    announcement: AnnouncementDto;
}

export interface AddQueueDto extends UpdateDto {
    queue: QueueDto;
}

export interface CloseRoomDto extends UpdateDto {
}

export interface DequeueDto extends UpdateDto {
    participantId: number;
    queueId: string;
}

export interface EditQueueDto extends UpdateDto {
    queue: QueueDto;
}

export interface EnqueueDto extends UpdateDto {
    participant: QueueParticipantDto;
    queueId: string;
}

export interface RemindDto extends UpdateDto {
    participant: ParticipantDto;
}

export interface RemoveAnnouncementDto extends UpdateDto {
    announcementId: string;
}

export interface RemoveQueueDto extends UpdateDto {
    queueId: string;
}

export interface InitialStateDto extends UpdateDto {
    announcements: AnnouncementDto[];
    history: AcceptDto[];
    queues: QueueDto[];
    room: RoomDto;
}

export interface RoomCreateDto {
    name: string;
}

export interface QueueCreateDto {
    assignmentSetId: number | null;
    name: string;
}

export interface QueueUpdateDto {
    name: string;
}

export interface AnnouncementCreateDto {
    content: string;
}

export interface QueueLengthDto {
    length: number;
    name: string;
}

export interface RoomQueueLengthsDto {
    queues: QueueLengthDto[];
    room: RoomDto;
}

export interface ErrorDto {
    code: string;
    message: string;
    path: string;
}
