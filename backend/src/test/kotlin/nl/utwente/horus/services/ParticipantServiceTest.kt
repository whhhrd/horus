package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.exceptions.ExistingThreadException
import nl.utwente.horus.exceptions.NoParticipantException
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.representations.participant.ParticipantCreateDto
import nl.utwente.horus.representations.participant.ParticipantUpdateDto
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import kotlin.streams.toList

class ParticipantServiceTest : HorusAbstractTest() {

    val nonExistingPersonId = 18318238191

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var commentService: CommentService

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testLabelLinkUnlink() {
        val student = getPPStudentParticipant()
        val oldLabelCount = student.labels.size

        val label = getFreshLabel()
        participantService.addLabel(student, label)

        assertEquals(oldLabelCount + 1, student.labels.size)
        assertTrue(label in student.labels)
        assertTrue(student in label.participants)

        participantService.removeLabelMapping(student, label)
        assertEquals(oldLabelCount, student.labels.size)
        assertFalse(label in student.labels)
        assertFalse(student in label.participants)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetParticipantsById() {
        val amount = 153
        val ids = PP_PARTICIPANT_IDS.take(amount)
        val participants = participantService.getParticipantsById(ids)
        assertEquals(ids.toSet(), participants.map { it.id }.toSet())
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetCourseStaff() {
        val participants = participantService.getCourseStaff(getPPCourse())
        assertEquals(PP_STAFF_PARTICIPANT_IDS.toSet(), participants.map { it.id }.toSet())
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetParticipantById() {
        val person = personService.createPerson("s123456", "Test Person",
                "TP", "Person, Test", "test@person.nl")
        val createdParticipant = participantService.createParticipant(PP_MOCK_COURSE_ID,
                ParticipantCreateDto(person.id, roleService.getTeacherRole().id))
        val retrievedParticipant = participantService.getParticipantById(createdParticipant.id)
        assertEquals(createdParticipant, retrievedParticipant)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testDoesParticipantExist() {
        assertFalse(participantService.doesParticipantExistAndIsEnabled(nonExistingPersonId, PP_MOCK_COURSE_ID))
        val somePerson = participantService.getParticipantById(PP_PARTICIPANT_IDS.first).person
        assertTrue(participantService.doesParticipantExistAndIsEnabled(somePerson.id, PP_MOCK_COURSE_ID))
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetCurrentParticipationInCourse() {
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        assertEquals(PP_TEACHER_LOGIN, participant.person.loginId)
    }

    @WithLoginId(SS_NA_LOGIN)
    @Test
    fun testGetCurrentParticipationInCourseInvalid() {
        assertThrows(ParticipantNotFoundException::class) {
            participantService.getCurrentParticipationInCourse(SS_MOCK_COURSE_ID)
        }
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetParticipationInCourse() {
        val person = getCurrentPerson()
        val participant = participantService.getParticipationInCourse(person, PP_MOCK_COURSE_ID)
        assertEquals(PP_TEACHER_LOGIN, participant.person.loginId)
    }

    @WithLoginId(SS_NA_LOGIN)
    @Test
    fun testGetParticipationInCourseInvalid() {
        val person = getCurrentPerson()
        assertThrows(NoParticipantException::class) {
            participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
        }
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetParticipationsInCourseEmpty() {
        val participants = participantService.getParticipationsInCourse(setOf(), PP_MOCK_COURSE_ID).toList()
        assertEquals(0, participants.size)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetParticipationsInCourse() {
        val participants = participantService.getParticipationsInCourse(PP_STAFF_PERSON_IDS.toSet(),
                PP_MOCK_COURSE_ID).toList()
        assertEquals(PP_STAFF_PERSON_IDS.count(), participants.size)
        assertEquals(PP_STAFF_PARTICIPANT_IDS.toSet(), participants.map { it.id }.toSet())
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetParticipationsInCourseByLoginIdEmpty() {
        val participants = participantService.getParticipationsInCourseByLoginId(setOf(), PP_MOCK_COURSE_ID).toList()
        assertEquals(0, participants.size)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetParticipationsInCourseByLoginId() {
        val participants = participantService.getParticipationsInCourse(PP_STAFF_PERSON_IDS.toSet(),
                PP_MOCK_COURSE_ID).toList()
        val retrievedParticipants = participantService.getParticipationsInCourseByLoginId(
                participants.map { it.person.loginId }.toSet(), PP_MOCK_COURSE_ID).toList()
        assertEquals(participants, retrievedParticipants)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testGetCourseParticipationsStream() {
        val expectedParticipantIDs = (PP_PARTICIPANT_IDS + PP_STAFF_PARTICIPANT_IDS).toSet()
        val actualParticipantIDs = participantService.getCourseParticipationsStream(
                getPPCourse()).toList().map { it.id }.toSet()
        assertEquals(expectedParticipantIDs, actualParticipantIDs)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testCreateParticipantWithoutDto() {
        val person = personService.createPerson("s123456", "Test Person",
                "TP", "Person, Test", "test@person.nl")
        val createdParticipant = participantService.createParticipant(PP_MOCK_COURSE_ID,
                ParticipantCreateDto(person.id, roleService.getTeacherRole().id))
        assertEquals(person, createdParticipant.person)
        assertEquals(getPPCourse(), createdParticipant.course)
        assertEquals(roleService.getTeacherRole(), createdParticipant.role)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testCreateParticipantWithDto() {
        val person = personService.createPerson("s123456", "Test Person",
                "TP", "Person, Test", "test@person.nl")
        val createdParticipant = participantService.createParticipant(
                person, getPPCourse(), roleService.getTeacherRole())
        assertEquals(person, createdParticipant.person)
        assertEquals(getPPCourse(), createdParticipant.course)
        assertEquals(roleService.getTeacherRole(), createdParticipant.role)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testUpdateParticipantWithDto() {
        val person = personService.createPerson("s123456", "Test Person",
                "TP", "Person, Test", "test@person.nl")
        val createdParticipant = participantService.createParticipant(
                person, getPPCourse(), roleService.getTeacherRole())
        assertTrue(createdParticipant.enabled)
        val participantUpdate = ParticipantUpdateDto(roleService.getTeacherRole().id, null, false)
        val updatedParticipant = participantService.updateParticipant(createdParticipant.id, participantUpdate)
        assertFalse(updatedParticipant.enabled)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testUpdateParticipantWithoutDto() {
        val person = personService.createPerson("s123456", "Test Person",
                "TP", "Person, Test", "test@person.nl")
        val createdParticipant = participantService.createParticipant(
                person, getPPCourse(), roleService.getTeacherRole())
        assertTrue(createdParticipant.enabled)
        val updatedParticipant = participantService.updateParticipant(createdParticipant.id,
                roleService.getTeacherRole().id, null, false)
        assertFalse(updatedParticipant.enabled)
    }

    @WithLoginId(PP_TEACHER_LOGIN)
    @Test
    fun testAddThread() {
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val commentThread1 = commentService.createThread(CommentType.STAFF_ONLY, "M", getPPTeacherParticipant())
        participantService.addThread(participant, commentThread1)
        val updatedParticipant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        assertEquals(commentThread1, updatedParticipant.commentThread)

        // Also try to assign a comment thread if one is already there
        val commentThread2 = commentService.createThread(CommentType.STAFF_ONLY, "N", getPPTeacherParticipant())
        assertThrows(ExistingThreadException::class) {
            participantService.addThread(participant, commentThread2)
        }
        val updatedParticipant2 = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        assertEquals(commentThread1, updatedParticipant2.commentThread)
    }

}
