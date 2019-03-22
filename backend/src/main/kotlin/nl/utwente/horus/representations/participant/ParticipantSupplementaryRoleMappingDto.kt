package nl.utwente.horus.representations.participant

import nl.utwente.horus.entities.auth.ParticipantSupplementaryRoleMapping
import java.time.ZonedDateTime

data class ParticipantSupplementaryRoleMappingDto(
        val participantId: Long,
        val roleId: Long,
        val assignedBy: ParticipantDtoBrief,
        val assignedAt: ZonedDateTime
) {
    constructor(m: ParticipantSupplementaryRoleMapping) : this(m.participant.id, m.supplementaryRole.id,
            ParticipantDtoBrief(m.assignedBy), m.assignedAt)
}