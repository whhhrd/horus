package nl.utwente.horus.representations.participant

import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.person.PersonDtoBrief
import java.time.ZonedDateTime

open class ParticipantDto {
    val id: Long
    val person: PersonDtoBrief
    val courseCode: Long
    val role: RoleDtoBrief
    val commentThread: CommentThreadDtoBrief?
    val enabled: Boolean
    val createdAt: ZonedDateTime

    constructor(id: Long, person: PersonDtoBrief, courseCode: Long, role: RoleDtoBrief, commentThread: CommentThreadDtoBrief?, enabled: Boolean, createdAt: ZonedDateTime) {
        this.id = id
        this.person = person
        this.courseCode = courseCode
        this.role = role
        this.commentThread = commentThread
        this.enabled = enabled
        this.createdAt = createdAt
    }

    constructor(p: Participant) : this(p.id, PersonDtoBrief(p.person), p.course.id,
            RoleDtoBrief(p.role), p.commentThread?.let { CommentThreadDtoBrief(it) }, p.enabled, p.createdAt)
}