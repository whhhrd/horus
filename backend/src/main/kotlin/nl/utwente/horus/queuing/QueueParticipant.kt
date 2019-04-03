package nl.utwente.horus.queuing

import nl.utwente.horus.representations.queuing.QueueParticipantDto
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

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

    fun toDto(): QueueParticipantDto {
        val time = ZonedDateTime.ofInstant(addedAt, ZoneId.systemDefault())
        return QueueParticipantDto(id, fullName, time)
    }
}