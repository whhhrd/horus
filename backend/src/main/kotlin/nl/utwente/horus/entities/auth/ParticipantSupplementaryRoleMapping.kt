package nl.utwente.horus.entities.auth

import nl.utwente.horus.entities.participant.Participant
import java.io.Serializable
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
data class ParticipantSupplementaryRoleMapping (
        @EmbeddedId
        private val id: ParticipantSupplementaryRoleMappingId,

        @ManyToOne
        @JoinColumn(name = "assigned_by")
        val assignedBy: Participant,

        val assignedAt: ZonedDateTime

) {
    @Embeddable
    data class ParticipantSupplementaryRoleMappingId(
            @ManyToOne
            val supplementaryRole: SupplementaryRole,

            @ManyToOne
            val participant: Participant
    ): Serializable

    constructor(supplementaryRole: SupplementaryRole, participant: Participant, assigner: Participant) :
            this(ParticipantSupplementaryRoleMappingId(supplementaryRole, participant), assigner, ZonedDateTime.now())

    val supplementaryRole
        get() = this.id.supplementaryRole

    val participant
        get() = this.id.participant

}