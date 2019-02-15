package nl.utwente.horus

import me.ntrrgc.tsGenerator.TypeScriptGenerator
import nl.utwente.horus.representations.assignment.AssignmentDtoSummary
import nl.utwente.horus.representations.assignment.AssignmentGroupSetsMappingDto
import nl.utwente.horus.representations.assignment.AssignmentSetDtoFull
import nl.utwente.horus.representations.assignment.SignOffResultDtoSummary
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.comment.CommentDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.representations.course.CourseDtoFull
import nl.utwente.horus.representations.group.GroupDtoFull
import nl.utwente.horus.representations.group.GroupSetDtoFull
import nl.utwente.horus.representations.participant.ParticipantDto
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

                    RoleDtoBrief::class,

                    CommentDto::class,
                    CommentThreadDtoFull::class,

                    CourseDtoFull::class,

                    GroupDtoFull::class,
                    GroupSetDtoFull::class,

                    ParticipantDto::class,

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