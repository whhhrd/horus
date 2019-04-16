package nl.utwente.horus

import junit.framework.Assert.assertTrue
import junit.framework.Assert.fail
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.InsufficientPermissionsException
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import kotlin.reflect.KClass

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
abstract class HorusAbstractTest {

    @Autowired
    private lateinit var participantService: ParticipantService

    @Autowired
    private lateinit var courseService: CourseService

    @Autowired
    private lateinit var userDetailService: HorusUserDetailService

    @Autowired
    private lateinit var labelService: LabelService

    @Autowired
    private lateinit var personService: PersonService

    companion object {
        const val PP_TEACHER_LOGIN = "s1843141"
        const val PP_TA_LOGIN = "s1839047"
        const val PP_STUDENT_LOGIN = "s55619"

        const val SS_TEACHER_LOGIN = "s1839047"
        const val SS_TA_LOGIN = "s1843141"
        const val SS_ALT_TA_LOGIN = "s1782215"
        const val SS_STUDENT_LOGIN = "s55619"
        const val SS_NA_LOGIN = "s13622" // NA = No Access

        const val COLOR_STR = "8B4513"

        const val PP_TEACHER_PARTICIPANT_ID: Long = 1
        const val PP_STUDENT_PARTICIPANT_ID: Long = 11
        const val SS_TEACHER_PERSON_ID: Long = 493
        const val SS_STUDENT_PERSON_ID_1: Long = 501
        const val SS_STUDENT_PERSON_ID_2: Long = 2

        const val NO_SS_PERSON_ID: Long = 490

        const val PP_MOCK_COURSE_ID: Long = 1
        const val SS_MOCK_COURSE_ID: Long = 2

        val PP_PARTICIPANT_IDS = (11L..500L)
        val PP_STAFF_PARTICIPANT_IDS = (1L..5L)
        val PP_STAFF_PERSON_IDS = (491L..495L)
        val SS_PARTICIPANT_IDS = (501L..821L)
        const val SS_PARTICIPANT_ID_WITH_COMMENT_THREAD = 789L
        const val SS_PARTICIPANT_ID_WITHOUT_COMMENT_THREAD = 790L
        const val PP_GROUPSET_ID = 1L
        const val SS_GROUP_SET_ID = 2L
        const val SS_GROUP_ID = 352L

        const val SS_ASSIGNMENT_SET_ID: Long = 5
        val CC_ASSIGNMENT_IDS = (1L..35L)
        val PP_SIGN_OFF_RESULT_IDS = (100L..1000L)

        const val SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD: Long = 120

        const val SS_SIGN_OFF_RESULT_ID_WITH_COMMENT_THREAD: Long = 38544
        const val SS_SIGN_OFF_RESULT_ID_WITHOUT_COMMENT_THREAD: Long = 38482

        const val SS_COMMENT_THREAD_ID: Long = 2433
        const val SS_COMMENT_ID: Long = 2433

        const val TEST_LABEL_ID: Long = 1
        const val SS_LABEL_ID_1: Long = 17 // Should not be assigned to first participant of SS
        const val SS_LABEL_ID_2: Long = 4 // Should be assigned to first participant of SS
    }

    fun getCurrentPerson(): Person {
        return userDetailService.getCurrentPerson()
    }

    fun getPPTeacherParticipant(): Participant {
        return participantService.getParticipantById(PP_TEACHER_PARTICIPANT_ID)
    }

    fun getPPStudentParticipant(): Participant {
        return participantService.getParticipantById(PP_STUDENT_PARTICIPANT_ID)
    }

    fun getSSTeacherParticipant(): Participant {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        return participantService.getParticipationInCourse(person, SS_MOCK_COURSE_ID)
    }

    fun getPPCourse(): Course {
        return courseService.getCourseById(PP_MOCK_COURSE_ID)
    }

    fun getSSCourse(): Course {
        return courseService.getCourseById(SS_MOCK_COURSE_ID)
    }

    fun getFreshLabel(): Label {
        return labelService.createLabel(getPPCourse(), "test-label", COLOR_STR)
    }

    fun <T: Exception> assertThrows(eClass: KClass<T>, function: () -> Unit) {
        try {
            function()
            fail()
        } catch (e: Exception) {
            assertTrue("Found exception ${e::class.simpleName} is no instance of ${eClass.simpleName}",
                    eClass.isInstance(e))
        }
    }

    fun assertInsufficientPermissions(function: () -> Unit) {
        assertThrows(InsufficientPermissionsException::class, function)
    }

    fun assertSufficientPermissions(function: () -> Unit) {
        try {
            function()
        } catch (e: InsufficientPermissionsException) {
            fail()
        }
    }

}

