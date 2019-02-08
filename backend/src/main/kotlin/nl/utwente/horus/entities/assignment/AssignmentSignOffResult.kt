package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.participant.Participant
import java.io.Serializable
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class AssignmentSignOffResult (
    @EmbeddedId
    private val id: AssignmentSignOffResultId,

    @OneToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_thread_id")
    var commentThread: CommentThread?,


    var result: SignOffResult,

    @ManyToOne
    var signer: Participant,

    var signedAt: ZonedDateTime
) {
    @Embeddable
    data class AssignmentSignOffResultId (
            @ManyToOne
            val participant: Participant,

            @ManyToOne
            val assignment: Assignment
    ): Serializable

    val assignment
        get() = this.id.assignment

    val participant
        get() = this.id.participant

    constructor(participant: Participant, assignment: Assignment, result: SignOffResult, signer: Participant): this(AssignmentSignOffResultId(participant, assignment), null, result, signer, ZonedDateTime.now())
}