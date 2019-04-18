package nl.utwente.horus.services.queuing

import nl.utwente.horus.exceptions.AssignmentSetNotFoundException
import nl.utwente.horus.exceptions.EmptyStringException
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.queuing.QueuingStateManager
import nl.utwente.horus.representations.queuing.*
import nl.utwente.horus.representations.queuing.updates.AcceptDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional(readOnly = true)
class QueuingService {

    @Autowired
    private lateinit var queuingStateManager: QueuingStateManager

    @Autowired
    private lateinit var participantService: ParticipantService

    @Autowired
    private lateinit var assignmentService: AssignmentService

    fun getRooms(courseId: Long): List<RoomDto> {
        return queuingStateManager.getRooms(courseId)
    }

    fun getRoomQueueLengths(courseId: Long): List<RoomQueueLengthsDto> {
        return queuingStateManager.getRoomQueueLengths(courseId)
    }

    fun createRoom(courseId: Long, name: String): RoomDto {
        return queuingStateManager.createRoom(courseId, name)
    }

    fun closeRoom(courseId: Long, code: String) {
        return queuingStateManager.closeRoom(courseId, code)
    }

    fun addAnnouncement(courseId: Long, roomCode: String, content: String): AnnouncementDto {
        if (content.isBlank()) {
            throw EmptyStringException()
        }
        return queuingStateManager.addAnnouncement(courseId, roomCode, content)
    }

    fun removeAnnouncement(courseId: Long, roomCode: String, id: String) {
        return queuingStateManager.removeAnnouncement(courseId, roomCode, id)
    }

    fun createQueue(courseId: Long, roomCode: String, name: String, assignmentSetId: Long?): QueueDto {
        if (name.isBlank()) {
            throw EmptyStringException()
        }
        if (assignmentSetId != null && assignmentService.getAssignmentSetById(assignmentSetId).course.id != courseId) {
            throw AssignmentSetNotFoundException()
        }
        return queuingStateManager.createQueue(courseId, roomCode, name, assignmentSetId)
    }

    fun editQueue(courseId: Long, roomCode: String, id: String, name: String): QueueDto {
        if (name.isBlank()) {
            throw EmptyStringException()
        }
        return queuingStateManager.editQueue(courseId, roomCode, id, name)
    }

    fun deleteQueue(courseId: Long, roomCode: String, id: String) {
        return queuingStateManager.deleteQueue(courseId, roomCode, id)
    }

    fun enqueue(courseId: Long, roomCode: String, queueId: String): QueueParticipantDto {
        val participant = participantService.getCurrentParticipationInCourse(courseId)
        val allowedAssignmentSets = assignmentService.getAssignmentSetsByParticipant(participant).map { it.id }
        return queuingStateManager.enqueueParticipant(courseId, roomCode, queueId, participant.id, participant.person.fullName, allowedAssignmentSets)
    }

    fun dequeue(courseId: Long, roomCode: String, queueId: String) {
        val participant = participantService.getCurrentParticipationInCourse(courseId)
        return queuingStateManager.dequeueParticipant(courseId, roomCode, queueId, participant.id)
    }

    fun dequeueParticipant(courseId: Long, roomCode: String, queueId: String, participantId: Long) {
        return queuingStateManager.dequeueParticipant(courseId, roomCode, queueId, participantId)
    }

    fun acceptNext(courseId: Long, roomCode: String, queueId: String): AcceptDto {
        val acceptor = participantService.getCurrentParticipationInCourse(courseId)
        return queuingStateManager.acceptParticipant(courseId, roomCode, queueId, acceptor.id, acceptor.person.fullName)
    }

    fun acceptParticipant(courseId: Long, roomCode: String, queueId: String, participantId: Long): AcceptDto {
        val acceptor = participantService.getCurrentParticipationInCourse(courseId)
        return queuingStateManager.acceptParticipant(courseId, roomCode, queueId, participantId, acceptor.id, acceptor.person.fullName)
    }

    fun sendReminder(courseId: Long, roomCode: String, id: Long) {
        val participant = participantService.getParticipantById(id)
        if (participant.course.id != courseId) throw ParticipantNotFoundException()

        return queuingStateManager.sendReminder(courseId, roomCode, id, participant.person.fullName)
    }
}