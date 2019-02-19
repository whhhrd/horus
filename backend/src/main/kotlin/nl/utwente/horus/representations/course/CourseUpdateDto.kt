package nl.utwente.horus.representations.course

import java.time.ZonedDateTime

data class CourseUpdateDto (
        val name: String,
        val courseCode: String?,
        val archivedAt: ZonedDateTime?
)