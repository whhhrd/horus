package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.participant.Participant
import java.io.Serializable
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class AssignmentSignOffResult (
    @EmbeddedId
    private val id: AssignmentSignOffResultId,

    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_thread_id_seq")
    val commentThreadId: Long = 0,

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

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "threadId", referencedColumnName = "commentThreadId")
    val comments: MutableSet<Comment> = HashSet()

    constructor(participant: Participant, assignment: Assignment, result: SignOffResult, signer: Participant): this(AssignmentSignOffResultId(participant, assignment), 0, result, signer, ZonedDateTime.now())
}