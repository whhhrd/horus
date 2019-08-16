package nl.utwente.horus

import me.ntrrgc.tsGenerator.TypeScriptGenerator
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.representations.BooleanResultDto
import nl.utwente.horus.representations.assignment.*
import nl.utwente.horus.representations.auth.HorusAuthorityDto
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.auth.SupplementaryRoleCreateUpdateDto
import nl.utwente.horus.representations.auth.SupplementaryRoleDto
import nl.utwente.horus.representations.canvas.CanvasCourseDto
import nl.utwente.horus.representations.canvas.CanvasTokenDto
import nl.utwente.horus.representations.comment.*
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.dashboard.StudentDashboardDto
import nl.utwente.horus.representations.dsl.LabelQueryNodeDto
import nl.utwente.horus.representations.dsl.OperatorQueryNodeDto
import nl.utwente.horus.representations.error.ErrorDto
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoFull
import nl.utwente.horus.representations.job.BatchJobDto
import nl.utwente.horus.representations.participant.*
import nl.utwente.horus.representations.person.PersonDtoFull
import nl.utwente.horus.representations.queuing.ParticipantDto
import nl.utwente.horus.representations.queuing.QueueDto
import nl.utwente.horus.representations.queuing.RoomDto
import nl.utwente.horus.representations.queuing.RoomQueueLengthsDto
import nl.utwente.horus.representations.queuing.requests.AnnouncementCreateDto
import nl.utwente.horus.representations.queuing.requests.QueueCreateDto
import nl.utwente.horus.representations.queuing.requests.QueueUpdateDto
import nl.utwente.horus.representations.queuing.requests.RoomCreateDto
import nl.utwente.horus.representations.queuing.updates.*
import nl.utwente.horus.representations.signoff.GroupAssignmentSetSearchResultDto
import nl.utwente.horus.representations.signoff.SignOffResultPatchDto
import java.io.File
import java.time.ZonedDateTime

fun generate() {
    val generator = TypeScriptGenerator(
            rootClasses = setOf(
                    AssignmentSetDtoFull::class,
                    AssignmentGroupSetsMappingDto::class,
                    AssignmentDtoSummary::class,
                    SignOffResultDtoSummary::class,
                    AssignmentCreateUpdateDto::class,
                    AssignmentSetCreateDto::class,
                    AssignmentSetUpdateDto::class,
                    SignOffResultDtoCompact::class,

                    RoleDtoBrief::class,
                    SupplementaryRoleCreateUpdateDto::class,
                    ParticipantSupplementaryRoleMappingDto::class,
                    SupplementaryRoleDto::class,

                    BooleanResultDto::class,
                    CanvasCourseDto::class,
                    CanvasTokenDto::class,

                    CommentDto::class,
                    CommentThreadDtoFull::class,
                    CommentCreateDto::class,
                    CommentThreadCreateDto::class,
                    CommentThreadUpdateDto::class,
                    CommentUpdateDto::class,

                    CourseDtoFull::class,
                    CourseCreateDto::class,
                    CourseUpdateDto::class,

                    StudentDashboardDto::class,

                    GroupDtoFull::class,
                    GroupSetDtoFull::class,
                    GroupAssignmentSetSearchResultDto::class,

                    BatchJobDto::class,

                    LabelCreateUpdateDto::class,
                    LabelDto::class,
                    ParticipantDtoBrief::class,
                    ParticipantDtoFull::class,
                    ParticipantCreateDto::class,
                    ParticipantUpdateDto::class,

                    PersonDtoFull::class,

                    SignOffResultPatchDto::class,

                    RoomDto::class,
                    QueueDto::class,
                    ParticipantDto::class,
                    UpdateType::class,
                    UpdateDto::class,
                    AcceptDto::class,
                    AddAnnouncementDto::class,
                    AddQueueDto::class,
                    CloseRoomDto::class,
                    DequeueDto::class,
                    EditQueueDto::class,
                    EnqueueDto::class,
                    RemindDto::class,
                    RemoveAnnouncementDto::class,
                    RemoveQueueDto::class,
                    InitialStateDto::class,
                    RoomCreateDto::class,
                    QueueCreateDto::class,
                    QueueUpdateDto::class,
                    AnnouncementCreateDto::class,
                    RoomQueueLengthsDto::class,

                    LabelQueryNodeDto::class,
                    OperatorQueryNodeDto::class,

                    HorusAuthorityDto::class,
                    HorusResource::class,
                    ErrorDto::class
            ),
            mappings = mapOf(
                    ZonedDateTime::class to "Date"
            )
    )
    File("entities.d.ts").writeText(generator.definitionsText)
}

//fun main(args: Array<String>) {
//    generate()
//}
