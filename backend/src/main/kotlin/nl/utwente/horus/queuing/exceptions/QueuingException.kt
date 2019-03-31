package nl.utwente.horus.queuing.exceptions

import org.springframework.http.HttpStatus
import java.lang.Exception

abstract class QueuingException: Exception {

    val httpStatus: HttpStatus

    constructor(message: String, httpStatus: HttpStatus) : super(message) {
        this.httpStatus = httpStatus
    }

}

class RoomNotFoundException: QueuingException("Room not found or already closed", HttpStatus.NOT_FOUND)
class AnnouncementNotFoundException: QueuingException("Announcement not found or already closed", HttpStatus.NOT_FOUND)
class QueueNotFoundException: QueuingException("Queue not found", HttpStatus.NOT_FOUND)
class ParticipantNotFoundException: QueuingException("Participant not found", HttpStatus.NOT_FOUND)

class ParticipantAlreadyInQueueException: QueuingException("Participant already in queue", HttpStatus.BAD_REQUEST)

class ParticipantCannotBeEnqueuedForQueueException: QueuingException("Participant cannot be enqueued for this queue", HttpStatus.FORBIDDEN)