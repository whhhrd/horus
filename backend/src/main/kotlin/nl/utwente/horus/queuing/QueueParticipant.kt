package nl.utwente.horus.queuing

import nl.utwente.horus.representations.queuing.ParticipantDto
import java.time.Instant

class QueueParticipant: Comparable<QueueParticipant> {
    val id: Long
    val fullName: String
    val addedAt: Instant

    constructor(id: Long, fullName: String, addedAt: Instant) {
        this.id = id
        this.fullName = fullName
        this.addedAt = addedAt
    }

    override fun equals(other: Any?): Boolean {
        return other is QueueParticipant && other.id == id
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }

    override fun compareTo(other: QueueParticipant): Int {
        return  if (addedAt.isBefore(other.addedAt)) -1 else 1
    }

    fun toDto(): ParticipantDto {
        return ParticipantDto(id, fullName)
    }
}