package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.comment.CommentThread
import java.time.ZonedDateTime

open class AssignmentDtoBrief {
    val id: Long
    val name: String
    val commentThreadId: Long?
    val createdAt: ZonedDateTime
    val milestone: Boolean

    constructor(id: Long, name: String, commentThread: CommentThread?, createdAt: ZonedDateTime, milestone: Boolean) {
        this.id = id
        this.name = name
        this.commentThreadId = commentThread?.id
        this.createdAt = createdAt
        this.milestone = milestone
    }

    constructor(a: Assignment) : this(a.id, a.name, a.commentThread, a.createdAt, a.milestone)
}
