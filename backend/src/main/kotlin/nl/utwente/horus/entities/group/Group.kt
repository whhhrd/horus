package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.participant.Participant
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@Table(name = "\"group\"")
@NamedEntityGraph(name = "allGroupMembers",
        attributeNodes = [NamedAttributeNode("members")],
        subgraphs = [NamedSubgraph(name = "members", attributeNodes = [NamedAttributeNode("participant")])])
data class Group (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @ManyToOne
        val groupSet: GroupSet,

        var externalId: String?,

        @OneToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "comment_thread_id")
        var commentThread: CommentThread?,

        var name: String,

        @ManyToOne
        @JoinColumn(name = "created_by")
        val createdBy: Participant,

        val createdAt: ZonedDateTime,

        var archivedAt: ZonedDateTime?
) {

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "id.group", cascade = [CascadeType.ALL], orphanRemoval = true)
    val members: MutableSet<GroupMember> = HashSet()

    val participants
        get() = this.members.map { member -> member.participant }

    val archived
        get() = this.archivedAt != null

    constructor(groupSet: GroupSet, externalId: String?, name: String, createdBy: Participant): this(0, groupSet, externalId, null, name, createdBy, ZonedDateTime.now(), null)
}
