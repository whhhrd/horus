package nl.utwente.horus.representations.comment

import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.representations.person.PersonDtoBrief
import java.time.ZonedDateTime

open class CommentDto {
    val id: Long
    val thread: CommentThreadDtoBrief
    val person: PersonDtoBrief
    val content: String
    val createdAt: ZonedDateTime
    val lastEditedAt: ZonedDateTime

    constructor(id: Long, thread: CommentThreadDtoBrief, person: PersonDtoBrief, content: String, createdAt: ZonedDateTime, lastEditedAt: ZonedDateTime) {
        this.id = id
        this.thread = thread
        this.person = person
        this.content = content
        this.createdAt = createdAt
        this.lastEditedAt = lastEditedAt
    }

    constructor(comment: Comment) : this(comment.id, CommentThreadDtoBrief(comment.thread),
            PersonDtoBrief(comment.person), comment.content, comment.createdAt, comment.lastEditedAt)
}