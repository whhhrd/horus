package nl.utwente.horus.queuing

import nl.utwente.horus.representations.queuing.QueueDto
import java.time.Instant
import java.time.ZonedDateTime
import java.util.*
import kotlin.collections.HashSet

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

    constructor(courseId: Long, roomCode: String, name: String, assignmentSetId: Long?) {
        this.courseId = courseId
        this.roomCode = roomCode
        this.name = name
        this.assignmentSetId = assignmentSetId
        this.createdAt = ZonedDateTime.now()
    }

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

    fun dequeueParticipant(id: Long): QueueParticipant? {
        return if (memberIds.contains(id)) {
            memberIds.remove(id)
            val participant = queue.find { it.id == id }!!
            queue.remove(participant)
            participant
        } else null
    }

    fun dequeueParticipant(): QueueParticipant? {
        return if (queue.isNotEmpty()) {
            val participant = queue.pop()
            memberIds.remove(participant.id)
            participant
        } else null
    }

    fun toDto(): QueueDto {
        return QueueDto(id, courseId, roomCode, assignmentSetId, name, queue.map { it.toDto() }, createdAt)
    }
}