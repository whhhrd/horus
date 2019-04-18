package nl.utwente.horus.queuing

import nl.utwente.horus.representations.queuing.QueueParticipantDto
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

/**
 * Represents an enqueued participant.
 */
class QueueParticipant: Comparable<QueueParticipant> {

    // participant ID (the same as the internal course participant ID)
    val id: Long

    // full name for displaying in all the queueing parts
    val fullName: String

    // timestamp at which the participant was added to the queue
    val addedAt: Instant

    /**
     * Creates a new <code>QueueParticipant</code>.
     * @param id the ID of the participant.
     * @param fullName full name of the participant.
     * @param addedAt the time at which the participant was enqueued.
     */
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