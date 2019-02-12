package nl.utwente.horus.representations.course

import nl.utwente.horus.entities.course.Course
import java.time.ZonedDateTime


open class CourseDtoBrief {

    val id: Long
    val courseCode: String?
    val externalId: String?
    val name: String
    val archived: Boolean
    val createdAt: ZonedDateTime
    val archivedAt: ZonedDateTime?

    constructor(id: Long, courseCode: String?, externalId: String?, name: String, archived: Boolean, createdAt: ZonedDateTime, archivedAt: ZonedDateTime?) {
        this.id = id
        this.courseCode = courseCode
        this.externalId = externalId
        this.name = name
        this.archived = archived
        this.createdAt = createdAt
        this.archivedAt = archivedAt
    }

    constructor(course: Course): this(course.id, course.courseCode, course.externalId, course.name, course.archived, course.createdAt, course.archivedAt)

}