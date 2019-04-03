package nl.utwente.horus.representations.queuing

import java.time.ZonedDateTime

data class QueueDto(
        val id: String,
        val courseId: Long,
        val roomCode: String,
        val assignmentSetId: Long?,
        val name: String,
        var participants: List<QueueParticipantDto>,
        val createdAt: ZonedDateTime
)
