package nl.utwente.horus.queuing

import nl.utwente.horus.representations.queuing.QueueDto
import java.time.Instant
import java.time.ZonedDateTime
import java.util.*
import kotlin.collections.HashSet

/**
 * Represents a queue in the system.
 * Methods are *not* safe for concurrent use, and should be handled by caller.
 */
class Queue {

    val id = UUID.randomUUID().toString()

    val courseId: Long
    val roomCode: String
    var name: String
    var assignmentSetId: Long?
        private set

    val createdAt: ZonedDateTime

    private val queue = LinkedList<QueueParticipant>()

    val queueLength: Int
        get() = queue.size

    private val memberIds = HashSet<Long>()

    /**
     * Creates a new <code>Queue</code>.
     * @param courseId the ID of the course for the <code>Queue</code>.
     * @param roomCode the code of the <code>Room</code> for the <code>Queue</code>.
     * @param name name of the <code>Queue</code>.
     * @param assignmentSetId (optional) ID of the <code>AssignmentSet</code> to bind the <code>Queue</code> to.
     */
    constructor(courseId: Long, roomCode: String, name: String, assignmentSetId: Long?) {
        this.courseId = courseId
        this.roomCode = roomCode
        this.name = name
        this.assignmentSetId = assignmentSetId
        this.createdAt = ZonedDateTime.now()
    }

    /**
     * Add a new participant to the queue.
     * @param id ID of the participant.
     * @param fullName full name of the participant.
     * @return the added participant.
     */
    fun enqueueParticipant(id: Long, fullName: String): QueueParticipant? {
        return if (memberIds.contains(id)) {
            null
        } else {
            val participant = QueueParticipant(id, fullName, Instant.now())
            queue.add(participant)
            memberIds.add(id)
            participant
        }
    }

    /**
     * Dequeues a specific participant from the queue.
     * @param id ID of the participant.
     * @return the participant or null if not in queue.
     */
    fun dequeueParticipant(id: Long): QueueParticipant? {
        return if (memberIds.contains(id)) {
            memberIds.remove(id)
            val participant = queue.find { it.id == id }!!
            queue.remove(participant)
            participant
        } else null
    }

    /**
     * Dequeues next participant from the queue.
     * @return the participant or null if none in queue.
     */
    fun dequeueParticipant(): QueueParticipant? {
        return if (queue.isNotEmpty()) {
            val participant = queue.pop()
            memberIds.remove(participant.id)
            participant
        } else null
    }

    /**
     * Converts the queue to a serializable Data Transfer Object (DTO).
     * @return the DTO of the <code>Queue</code>
     */
    fun toDto(): QueueDto {
        return QueueDto(id, courseId, roomCode, assignmentSetId, name, queue.map { it.toDto() }, createdAt)
    }
}