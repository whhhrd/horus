package nl.utwente.horus.representations.participant

import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.person.PersonDtoBrief

open class ParticipantDtoBrief {
    val id: Long
    val person: PersonDtoBrief
    val courseId: Long
    val role: RoleDtoBrief
    val commentThread: CommentThreadDtoBrief?

    constructor(id: Long, person: PersonDtoBrief, courseId: Long, role: RoleDtoBrief, commentThread: CommentThreadDtoBrief?) {
        this.id = id
        this.person = person
        this.courseId = courseId
        this.role = role
        this.commentThread = commentThread
    }

    constructor(p: Participant): this(p.id, PersonDtoBrief(p.person), p.course.id, RoleDtoBrief(p.role), p.commentThread?.let { CommentThreadDtoBrief(it) })
}