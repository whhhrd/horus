package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.participant.Participant
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class Group (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val groupSet: GroupSet,

        var externalId: String?,

        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_thread_id_seq")
        val commentThreadId: Long = 0,

        var name: String,

        @ManyToOne
        var createdBy: Participant,

        var createdAt: ZonedDateTime,

        var archivedAt: ZonedDateTime?
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "id.group", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val members: MutableSet<GroupMember> = HashSet()

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "threadId", referencedColumnName = "commentThreadId")
    val comments: MutableSet<Comment> = HashSet()

    val participants
        get() = this.members.map { member -> member.participant }

    val archived
        get() = this.archivedAt != null

    constructor(groupSet: GroupSet, externalId: String?, name: String, createdBy: Participant): this(0, groupSet, externalId, 0, name, createdBy, ZonedDateTime.now(), null)
}