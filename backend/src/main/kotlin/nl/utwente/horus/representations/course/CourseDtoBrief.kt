package nl.utwente.horus.representations.course

import nl.utwente.horus.entities.course.Course
import java.time.ZonedDateTime


data class CourseDtoBrief (
        val id: Long,
        val courseCode: String?,
        val externalId: String?,
        val name: String,
        val archived: Boolean,
        val createdAt: ZonedDateTime,
        val archivedAt: ZonedDateTime?
) {
    constructor(course: Course): this(course.id, course.courseCode, course.externalId, course.name, course.archived, course.createdAt, course.archivedAt)
}