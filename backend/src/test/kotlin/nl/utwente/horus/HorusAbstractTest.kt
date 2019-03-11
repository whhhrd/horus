package nl.utwente.horus

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Label
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

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

    companion object {
        const val TEACHER_LOGIN = "s1843141"
        const val STUDENT_LOGIN = "s4677447"

        const val TEACHER_PARTICIPANT_ID: Long = 1000
        const val STUDENT_PARTICIPANT_ID: Long = 1100

        const val PP_MOCK_COURSE_ID: Long = 100

        val PP_PARTICIPANT_IDS = (1100L..1590L)

        val CC_ASSIGNMENT_IDS = (3000L..3030L)

        val COLOR_STR = "8B4513"

        const val TEST_LABEL_ID: Long = 1
    }

    fun getCurrentPerson(): Person {
        return userDetailService.getCurrentPerson()
    }

    fun getTeacherParticipant(): Participant {
        return participantService.getParticipantById(TEACHER_PARTICIPANT_ID)
    }

    fun getStudentParticipant(): Participant {
        return participantService.getParticipantById(STUDENT_PARTICIPANT_ID)
    }

    fun getPPCourse(): Course {
        return courseService.getCourseById(PP_MOCK_COURSE_ID)
    }

    fun getFreshLabel(): Label {
        return labelService.createLabel(getPPCourse(), "test-label", COLOR_STR)
    }



}

