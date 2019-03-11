package nl.utwente.horus.entities.assignment

import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.participant.Participant
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class SignOffResult (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,

    @ManyToOne
    val participant: Participant,

    @ManyToOne
    val assignment: Assignment,

    @OneToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_thread_id")
    var commentThread: CommentThread?,

    @Enumerated(EnumType.STRING)
    var result: SignOffResultType,

    @ManyToOne
    @JoinColumn(name = "signed_by")
    val signedBy: Participant,

    var signedAt: ZonedDateTime,

    @ManyToOne(optional = true)
    @JoinColumn(name = "archived_by")
    var archivedBy: Participant?,

    var archivedAt: ZonedDateTime?

) {
    constructor(participant: Participant, assignment: Assignment, result: SignOffResultType, signer: Participant, commentThread: CommentThread? = null): this(0, participant, assignment, commentThread, result, signer, ZonedDateTime.now(), null, null)

    val isArchived
        get() = archivedAt != null
}