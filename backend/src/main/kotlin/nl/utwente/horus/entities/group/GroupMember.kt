package nl.utwente.horus.entities.group

import nl.utwente.horus.entities.participant.Participant
import java.io.Serializable
import javax.persistence.*

@Entity
data class GroupMember (
        @EmbeddedId
       private val id: GroupMemberId
) {

    @Embeddable
    data class GroupMemberId (
            @ManyToOne
            val group: Group,

            @ManyToOne
            val participant: Participant
    ): Serializable

    constructor(group: Group, participant: Participant): this(GroupMemberId(group, participant))

    val group
        get() = this.id.group

    val participant
        get() = this.id.participant
}