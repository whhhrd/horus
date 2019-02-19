package nl.utwente.horus.representations.participant

data class ParticipantUpdateDto(
        val roleId: Long,
        val commentThreadId: Long?,
        val enabled: Boolean
)