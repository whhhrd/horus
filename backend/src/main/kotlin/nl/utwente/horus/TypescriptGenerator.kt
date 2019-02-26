package nl.utwente.horus

import me.ntrrgc.tsGenerator.TypeScriptGenerator
import nl.utwente.horus.representations.assignment.*
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.canvas.CanvasCourseDto
import nl.utwente.horus.representations.canvas.CanvasTokenCheckResultDto
import nl.utwente.horus.representations.canvas.CanvasTokenDto
import nl.utwente.horus.representations.comment.*
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoFull
import nl.utwente.horus.representations.participant.ParticipantCreateDto
import nl.utwente.horus.representations.participant.ParticipantDto
import nl.utwente.horus.representations.participant.ParticipantUpdateDto
import nl.utwente.horus.representations.person.PersonDtoFull
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

                    RoleDtoBrief::class,

                    CanvasTokenCheckResultDto::class,
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

                    GroupDtoFull::class,
                    GroupSetDtoFull::class,

                    ParticipantDto::class,
                    ParticipantCreateDto::class,
                    ParticipantUpdateDto::class,

                    PersonDtoFull::class
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