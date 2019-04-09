package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.queuing.QueuingService
import org.junit.After
import org.springframework.beans.factory.annotation.Autowired
import org.junit.Assert.*
import org.junit.Test
import java.lang.Exception

class QueuingServiceTest : HorusAbstractTest() {

    val nonExistingParticipantId = 131238123L

    @Autowired
    private lateinit var queuingService: QueuingService

    @Autowired
    private lateinit var participantService: ParticipantService

    @After
    fun closeAllRooms() {
        // All the rooms should be closed after every test
        val rooms = queuingService.getRooms(PP_MOCK_COURSE_ID)
        for (room in rooms) {
            queuingService.closeRoom(PP_MOCK_COURSE_ID, room.code)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetRoomsNone() {
        val rooms = queuingService.getRooms(PP_MOCK_COURSE_ID)
        assertEquals(0, rooms.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetRooms() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val rooms = queuingService.getRooms(PP_MOCK_COURSE_ID)
        assertEquals(1, rooms.size)
        assertEquals(room, rooms[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetRoomQueueLengthsNone() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queueLengths = queuingService.getRoomQueueLengths(PP_MOCK_COURSE_ID)
        assertEquals(1, queueLengths.size)
        assertEquals(room, queueLengths[0].room)
        assertEquals(0, queueLengths[0].queues.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetRoomQueueLengthsEmptyQueue() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        val queueLengths = queuingService.getRoomQueueLengths(PP_MOCK_COURSE_ID)
        assertEquals(1, queueLengths.size)
        assertEquals(room, queueLengths[0].room)
        assertEquals(1, queueLengths[0].queues.size)
        assertEquals(queue.name, queueLengths[0].queues[0].name)
        assertEquals(0, queueLengths[0].queues[0].length)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetRoomQueueLengths() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        queuingService.enqueue(PP_MOCK_COURSE_ID, room.code, queue.id)
        val queueLengths = queuingService.getRoomQueueLengths(PP_MOCK_COURSE_ID)
        assertEquals(1, queueLengths.size)
        assertEquals(room, queueLengths[0].room)
        assertEquals(1, queueLengths[0].queues.size)
        assertEquals(queue.name, queueLengths[0].queues[0].name)
        assertEquals(1, queueLengths[0].queues[0].length)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateRoom() {
        val roomName = "Room"
        val createdRoom = queuingService.createRoom(PP_MOCK_COURSE_ID, roomName)
        val retrievedRoom = queuingService.getRooms(PP_MOCK_COURSE_ID)[0]
        assertEquals(roomName, createdRoom.name)
        assertEquals(createdRoom, retrievedRoom)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCloseRoom() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        queuingService.closeRoom(PP_MOCK_COURSE_ID, room.code)
        val rooms = queuingService.getRooms(PP_MOCK_COURSE_ID)
        assertEquals(0, rooms.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAddAnnouncement() {
        val announcementContent = "Announcement"
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val announcement = queuingService.addAnnouncement(PP_MOCK_COURSE_ID, room.code, announcementContent)
        assertEquals(announcementContent, announcement.content)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testRemoveAnnouncement() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val announcement = queuingService.addAnnouncement(PP_MOCK_COURSE_ID, room.code, "Announcement")
        val announcementId = announcement.id
        queuingService.removeAnnouncement(PP_MOCK_COURSE_ID, room.code, announcementId)
        assertThrows(Exception::class) {
            // The announcement is already removed, and therefore cannot be removed again.
            // If the announcement was correctly removed, removing it a second time should throw an exception.
            queuingService.removeAnnouncement(PP_MOCK_COURSE_ID, room.code, announcementId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateQueue() {
        val queueName = "Queue"
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, queueName, null)
        assertEquals(queueName, queue.name)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteQueue() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        val queueId = queue.id
        queuingService.deleteQueue(PP_MOCK_COURSE_ID, room.code, queueId)
        assertThrows(Exception::class) {
            // The queue is already removed, and therefore cannot be removed again.
            // If the queue was correctly removed, removing it a second time should throw an exception.
            queuingService.deleteQueue(PP_MOCK_COURSE_ID, room.code, queueId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testEnqueue() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        val queueEntry = queuingService.enqueue(PP_MOCK_COURSE_ID, room.code, queue.id)
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        assertEquals(participant.id, queueEntry.id)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDequeue() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        queuingService.enqueue(PP_MOCK_COURSE_ID, room.code, queue.id)
        queuingService.dequeue(PP_MOCK_COURSE_ID, room.code, queue.id)
        assertThrows(Exception::class) {
            // The participant is already dequeued, and therefore cannot be dequeued again.
            // If the participant was correctly dequeued, dequeuing a second time should throw an exception.
            queuingService.dequeue(PP_MOCK_COURSE_ID, room.code, queue.id)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDequeueParticipant() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        queuingService.enqueue(PP_MOCK_COURSE_ID, room.code, queue.id)
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        queuingService.dequeueParticipant(PP_MOCK_COURSE_ID, room.code, queue.id, participant.id)
        assertThrows(Exception::class) {
            // The participant is already dequeued, and therefore cannot be dequeued again.
            // If the participant was correctly dequeued, dequeuing a second time should throw an exception.
            queuingService.dequeueParticipant(PP_MOCK_COURSE_ID, room.code, queue.id, participant.id)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAcceptNext() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        queuingService.enqueue(PP_MOCK_COURSE_ID, room.code, queue.id)
        queuingService.acceptNext(PP_MOCK_COURSE_ID, room.code, queue.id)
        assertThrows(Exception::class) {
            // As the participant is already accepted, he/she cannot be dequeued.
            // When trying to dequeue anyway, an exception should be thrown.
            queuingService.dequeue(PP_MOCK_COURSE_ID, room.code, queue.id)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAcceptParticipant() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        val queue = queuingService.createQueue(PP_MOCK_COURSE_ID, room.code, "Queue", null)
        queuingService.enqueue(PP_MOCK_COURSE_ID, room.code, queue.id)
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        queuingService.acceptParticipant(PP_MOCK_COURSE_ID, room.code, queue.id, participant.id)
        assertThrows(Exception::class) {
            // As the participant is already accepted, he/she cannot be dequeued.
            // When trying to dequeue anyway, an exception should be thrown.
            queuingService.dequeue(PP_MOCK_COURSE_ID, room.code, queue.id)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testSendReminderParticipantNotFound() {
        val room = queuingService.createRoom(PP_MOCK_COURSE_ID, "Room")
        assertThrows(ParticipantNotFoundException::class) {
            queuingService.sendReminder(PP_MOCK_COURSE_ID, room.code, nonExistingParticipantId)
        }
    }

}
