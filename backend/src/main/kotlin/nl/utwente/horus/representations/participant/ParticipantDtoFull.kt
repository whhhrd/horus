package nl.utwente.horus.representations.participant

import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.person.PersonDtoBrief
import java.time.ZonedDateTime

open class ParticipantDtoFull: ParticipantDtoBrief {
    var labels: List<LabelDto>
    val enabled: Boolean
    val createdAt: ZonedDateTime

    constructor(id: Long, person: PersonDtoBrief, courseId: Long, role: RoleDtoBrief, commentThread: CommentThreadDtoBrief?, labels: List<LabelDto>, enabled: Boolean, createdAt: ZonedDateTime): super(id, person, courseId, role, commentThread) {
        this.labels = labels
        this.enabled = enabled
        this.createdAt = createdAt
    }

    constructor(p: Participant) : this(p.id, PersonDtoBrief(p.person), p.course.id,
            RoleDtoBrief(p.role), p.commentThread?.let { CommentThreadDtoBrief(it) }, p.labels.map { LabelDto(it) }, p.enabled, p.createdAt)
}