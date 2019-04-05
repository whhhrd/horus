package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.queuing.QueuingController
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.queuing.QueuingStateManager
import nl.utwente.horus.representations.queuing.requests.AnnouncementCreateDto
import nl.utwente.horus.representations.queuing.requests.QueueCreateDto
import nl.utwente.horus.representations.queuing.requests.RoomCreateDto
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import nl.utwente.horus.services.queuing.QueuingService
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class QueuingControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var queuingController: QueuingController

    @Autowired
    lateinit var queuingService: QueuingService

    @Autowired
    lateinit var queuingStateManager: QueuingStateManager

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var participantService: ParticipantService

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetRooms() {
        assertInsufficientPermissions { queuingController.getRooms(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetRooms() {
        assertSufficientPermissions { queuingController.getRooms(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetRooms() {
        assertSufficientPermissions { queuingController.getRooms(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetRooms() {
        assertSufficientPermissions { queuingController.getRooms(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateRoom() {
        val roomCreate = RoomCreateDto("NewRoom")
        assertThrows(ParticipantNotFoundException::class) {
            queuingController.createRoom(SS_MOCK_COURSE_ID, roomCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateRoom() {
        val roomCreate = RoomCreateDto("NewRoom")
        assertInsufficientPermissions { queuingController.createRoom(SS_MOCK_COURSE_ID, roomCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateRoom() {
        val roomCreate = RoomCreateDto("NewRoom")
        assertSufficientPermissions { queuingController.createRoom(SS_MOCK_COURSE_ID, roomCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateRoom() {
        val roomCreate = RoomCreateDto("NewRoom")
        assertSufficientPermissions { queuingController.createRoom(SS_MOCK_COURSE_ID, roomCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACloseRoom() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertThrows(ParticipantNotFoundException::class) {
            queuingController.closeRoom(SS_MOCK_COURSE_ID, room.code) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCloseRoom() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertInsufficientPermissions { queuingController.closeRoom(SS_MOCK_COURSE_ID, room.code) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACloseRoom() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertSufficientPermissions { queuingController.closeRoom(SS_MOCK_COURSE_ID, room.code) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCloseRoom() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertSufficientPermissions { queuingController.closeRoom(SS_MOCK_COURSE_ID, room.code) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcementCreate = AnnouncementCreateDto("NewAnnouncement")
        assertThrows(ParticipantNotFoundException::class) { queuingController.addAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcementCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcementCreate = AnnouncementCreateDto("NewAnnouncement")
        assertInsufficientPermissions { queuingController.addAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcementCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcementCreate = AnnouncementCreateDto("NewAnnouncement")
        assertSufficientPermissions { queuingController.addAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcementCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcementCreate = AnnouncementCreateDto("NewAnnouncement")
        assertSufficientPermissions { queuingController.addAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcementCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNARemoveAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcement = queuingService.addAnnouncement(SS_MOCK_COURSE_ID, room.code, "NewAnnouncement")
        assertThrows(ParticipantNotFoundException::class) { queuingController.removeAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcement.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentRemoveAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcement = queuingService.addAnnouncement(SS_MOCK_COURSE_ID, room.code, "NewAnnouncement")
        assertInsufficientPermissions { queuingController.removeAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcement.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTARemoveAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcement = queuingService.addAnnouncement(SS_MOCK_COURSE_ID, room.code, "NewAnnouncement")
        assertSufficientPermissions { queuingController.removeAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcement.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherRemoveAnnouncement() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val announcement = queuingService.addAnnouncement(SS_MOCK_COURSE_ID, room.code, "NewAnnouncement")
        assertSufficientPermissions { queuingController.removeAnnouncement(
                SS_MOCK_COURSE_ID, room.code, announcement.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queueCreate = QueueCreateDto("NewQueue", null)
        assertThrows(ParticipantNotFoundException::class) {
            queuingController.createQueue(SS_MOCK_COURSE_ID, room.code, queueCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queueCreate = QueueCreateDto("NewQueue", null)
        assertInsufficientPermissions { queuingController.createQueue(SS_MOCK_COURSE_ID, room.code, queueCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queueCreate = QueueCreateDto("NewQueue", null)
        assertSufficientPermissions { queuingController.createQueue(SS_MOCK_COURSE_ID, room.code, queueCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queueCreate = QueueCreateDto("NewQueue", null)
        assertSufficientPermissions { queuingController.createQueue(SS_MOCK_COURSE_ID, room.code, queueCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADeleteQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertThrows(ParticipantNotFoundException::class) {
            queuingController.deleteQueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDeleteQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertInsufficientPermissions { queuingController.deleteQueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADeleteQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertSufficientPermissions { queuingController.deleteQueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDeleteQueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertSufficientPermissions { queuingController.deleteQueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAEnqueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertThrows(ParticipantNotFoundException::class) {
            queuingController.enqueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentEnqueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertSufficientPermissions { queuingController.enqueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAEnqueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertInsufficientPermissions { queuingController.enqueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherEnqueue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertInsufficientPermissions { queuingController.enqueue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADequeue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        assertThrows(ParticipantNotFoundException::class) {
            queuingController.dequeue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDequeue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingService.enqueue(SS_MOCK_COURSE_ID, room.code, queue.id)
        assertSufficientPermissions { queuingController.dequeue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADequeue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingService.enqueue(SS_MOCK_COURSE_ID, room.code, queue.id)
        assertInsufficientPermissions { queuingController.dequeue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDequeue() {
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingService.enqueue(SS_MOCK_COURSE_ID, room.code, queue.id)
        assertInsufficientPermissions { queuingController.dequeue(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADequeueParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertThrows(ParticipantNotFoundException::class) { queuingController.dequeueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDequeueParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertInsufficientPermissions { queuingController.dequeueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADequeueParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertSufficientPermissions { queuingController.dequeueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDequeueParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertSufficientPermissions { queuingController.dequeueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAcceptNext() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertThrows(ParticipantNotFoundException::class) {
            queuingController.acceptNext(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAcceptNext() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertInsufficientPermissions { queuingController.acceptNext(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAcceptNext() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertSufficientPermissions { queuingController.acceptNext(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAcceptNext() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertSufficientPermissions { queuingController.acceptNext(SS_MOCK_COURSE_ID, room.code, queue.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAcceptParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertThrows(ParticipantNotFoundException::class) { queuingController.acceptParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAcceptParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertInsufficientPermissions { queuingController.acceptParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAcceptParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertSufficientPermissions { queuingController.acceptParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAcceptParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        val queue = queuingService.createQueue(SS_MOCK_COURSE_ID, room.code, "NewQueue", null)
        queuingStateManager.enqueueParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id, person.fullName, listOf())
        assertSufficientPermissions { queuingController.acceptParticipant(
                SS_MOCK_COURSE_ID, room.code, queue.id, participant.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNARemindParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertThrows(ParticipantNotFoundException::class) { queuingController.remindParticipant(
                SS_MOCK_COURSE_ID, room.code, participant.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentRemindParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertInsufficientPermissions { queuingController.remindParticipant(
                SS_MOCK_COURSE_ID, room.code, participant.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTARemindParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertSufficientPermissions { queuingController.remindParticipant(
                SS_MOCK_COURSE_ID, room.code, participant.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherRemindParticipant() {
        val person = personService.getPersonById(SS_STUDENT_PERSON_ID_2)
        val participant = participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        val room = queuingService.createRoom(SS_MOCK_COURSE_ID, "NewRoom")
        assertSufficientPermissions { queuingController.remindParticipant(
                SS_MOCK_COURSE_ID, room.code, participant.id) }
    }

}
