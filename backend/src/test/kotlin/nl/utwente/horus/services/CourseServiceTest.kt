package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.exceptions.CourseNotFoundException
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.participant.SupplementaryRoleService
import nl.utwente.horus.services.person.PersonService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.ZonedDateTime

class CourseServiceTest : HorusAbstractTest() {

    val newCourse = CourseCreateDto("TestCourse123",
            "TestCourse123CourseCode", "TestCourse123ExternalId")
    val ppCourseCode = "84736"
    val ppGroupSetId = 1L
    val fakeCourseId = 8138123912L

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    private lateinit var personService: PersonService

    @Autowired
    private lateinit var participantService: ParticipantService

    @Autowired
    private lateinit var supplementaryRoleService: SupplementaryRoleService

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testCoursesList() {
        val courses = courseService.getAllParticipatingCourses(getCurrentPerson())
        assertTrue("Current person has no courses", courses.isNotEmpty())
    }

    @Test
    @WithLoginId(STUDENT_LOGIN)
    fun testMultipleParticipations() {
        val participations = courseService.getAllParticipatingCourses(getCurrentPerson())
        assertTrue("Student doesn't have multiple courses", participations.size > 1)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetCourseById() {
        // Verify that the PP course can be retrieved
        val course = courseService.getCourseById(PP_MOCK_COURSE_ID)
        assertEquals(ppCourseCode, course.courseCode)

        // Verify that a course with a non-existing id cannot be retrieved
        try {
            courseService.getCourseById(fakeCourseId)
            fail() // If this point is encountered, fail the test
        } catch (e: CourseNotFoundException) {
            // As expected
        }
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetCourseByExternalId() {
        // Check that initially no course can be found
        try {
            courseService.getCourseByExternalId(newCourse.externalId!!)
            fail() // If this point is encountered, fail the test
        } catch (e: CourseNotFoundException) {
            // As expected, continue test
        }

        // But that after adding the course to the database, it can be found
        courseService.createCourse(newCourse)
        val course = courseService.getCourseByExternalId(newCourse.externalId!!)
        assertEquals(newCourse.name, course.name)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testExistsCourseByExternalId() {
        // Check that initially such a course does not exist
        var exists = courseService.existsCourseByExternalId(newCourse.externalId!!)
        assertFalse(exists)

        // But that after adding, it does
        courseService.createCourse(newCourse)
        exists = courseService.existsCourseByExternalId(newCourse.externalId!!)
        assertTrue(exists)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetAllCourses() {
        courseService.createCourse(newCourse)
        val courses = courseService.getAllCourses()

        // Check if both PP and new course are in the list with all courses
        var foundCourse1 = false
        var foundCourse2 = false
        for (course in courses) {
            if (course.courseCode == ppCourseCode) {
                foundCourse1 = true
            }
            if (course.courseCode == newCourse.courseCode) {
                foundCourse2 = true
            }
        }

        assertTrue(foundCourse1 && foundCourse2)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetAllParticipatingCourses() {
        courseService.createCourse(newCourse)
        val person = getCurrentPerson()
        val participatingCourses = courseService.getAllParticipatingCourses(person)

        // Check if PP course is retrieved, but new course is not (as person is not a participant)
        var correct = false
        for (course in participatingCourses) {
            if (course.courseCode == ppCourseCode) {
                correct = true
            } else if (course.courseCode == newCourse.courseCode) {
                correct = false
                break
            }
        }
        assertTrue(correct)

        // Check if a new person has no participating courses
        val otherPerson = personService.createPerson("t9128734",
                "Test123 Person", "Test123", "Person, Test123","test123person@te.st")
        val otherParticipatingCourses = courseService.getAllParticipatingCourses(otherPerson)
        assertEquals(0, otherParticipatingCourses.size)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetAssignmentSetsOfCourse() {
        courseService.getCourseById(PP_MOCK_COURSE_ID)

        // Check if PP course contains 4 assignment sets
        val assignmentSets = courseService.getAssignmentSetsOfCourse(PP_MOCK_COURSE_ID)
        assertEquals(4, assignmentSets.size)

        // Check if the assignment sets of PP course are as expected
        var found1 = false
        var found2 = false
        var found3 = false
        var found4 = false
        for (assignmentSet in assignmentSets) {
            when (assignmentSet.name) {
                "CC questions" -> found1 = true
                "CP questions" -> found2 = true
                "FP questions" -> found3 = true
                "LP questions" -> found4 = true
            }
        }
        assertTrue(found1 && found2 && found3 && found4)

        // Check that a new course has no assignment sets
        val otherCourse = courseService.createCourse(newCourse)
        val otherAssignmentSets = courseService.getAssignmentSetsOfCourse(otherCourse.id)
        assertEquals(0, otherAssignmentSets.size)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetAssignmentSetsOfCoursePerPerson() {
        // First test for a person that is not linked to PP course
        val person = getCurrentPerson()
        val assignmentSets = courseService.getAssignmentSetsOfCourseByPerson(PP_MOCK_COURSE_ID, person)

        // Check if 0 assignment sets are retrieved
        assertEquals(0, assignmentSets.size)

        // Then check for a person that is linked to PP course
        val otherPerson = courseService.getParticipantsOfCourse(PP_MOCK_COURSE_ID)[0].person
        val otherAssignmentSets = courseService.getAssignmentSetsOfCourseByPerson(PP_MOCK_COURSE_ID, otherPerson)

        // Check if PP course contains 4 assignment sets
        assertEquals(4, otherAssignmentSets.size)

        // Check if the assignment sets of PP course are as expected
        var found1 = false
        var found2 = false
        var found3 = false
        var found4 = false
        for (assignmentSet in otherAssignmentSets) {
            when (assignmentSet.name) {
                "CC questions" -> found1 = true
                "CP questions" -> found2 = true
                "FP questions" -> found3 = true
                "LP questions" -> found4 = true
            }
        }
        assertTrue(found1 && found2 && found3 && found4)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetGroupSetsOfCourse() {
        // Check if group set of PP course can be retrieved properly
        val groupSets = courseService.getGroupSetsOfCourse(PP_MOCK_COURSE_ID)
        assertEquals(1, groupSets.size)
        assertEquals(ppGroupSetId, groupSets[0].id)

        // Check if a new course has indeed no group sets
        val newCourse = courseService.createCourse(newCourse)
        val newCourseGroupSets = courseService.getGroupSetsOfCourse(newCourse.id)
        assertEquals(0, newCourseGroupSets.size)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetParticipantsOfCourse() {
        // First check if a new course has no participants
        val course = courseService.createCourse(newCourse)
        val participants = courseService.getParticipantsOfCourse(course.id)
        assertEquals(0, participants.size)

        // Then add a participant to the course, and verify if actually added
        val person = getCurrentPerson()
        participantService.createParticipant(person, course, 2L)
        val newParticipants = courseService.getParticipantsOfCourse(course.id)
        assertEquals(1, newParticipants.size)
        assertEquals(person, newParticipants[0].person)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetCurrentParticipationInCourse() {
        // First check if initially no participant in new course
        val course = courseService.createCourse(newCourse)
        try {
            courseService.getCurrentParticipationInCourse(course)
            fail() // If this point is encountered, fail the test
        } catch (e: ParticipantNotFoundException) {
            // As expected
        }

        // But after becoming a participant, verify if participant can be retrieved
        val person = getCurrentPerson()
        participantService.createParticipant(person, course, 2L)
        val participant = courseService.getCurrentParticipationInCourse(course)
        assertEquals(person, participant.person)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testCreateAssignmentSetInCourse() {
        // TODO
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testCreateCourse() {
        // Define function that asserts whether course creation went as expected
        val asExpected: (CourseCreateDto, Course) -> Unit = { courseCreate, course ->
            assertTrue(course.id > 0)
            assertEquals(courseCreate.name, course.name)
            assertEquals(courseCreate.courseCode, course.courseCode)
            assertEquals(courseCreate.externalId, course.externalId)
        }

        // Verify if course creation works as expected
        val initialCourse = courseService.createCourse(newCourse)
        asExpected(newCourse, initialCourse)

        // Verify if course creation also works if some fields are null
        val newOtherCourse1 = CourseCreateDto("TestCourse4", null, null)
        val otherCourse1 = courseService.createCourse(newOtherCourse1)
        asExpected(newOtherCourse1, otherCourse1)

        val newOtherCourse2 = CourseCreateDto("TestCourse5", null, "TestCourse5ExternalId")
        val otherCourse2 = courseService.createCourse(newOtherCourse2)
        asExpected(newOtherCourse2, otherCourse2)

        val newOtherCourse3 = CourseCreateDto("TestCourse6", "TestCourse6CourseCode", null)
        val otherCourse3 = courseService.createCourse(newOtherCourse3)
        asExpected(newOtherCourse3, otherCourse3)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testCreateCourseAlternative() {
        // Define function that asserts whether course creation went as expected
        val asExpected: (CourseCreateDto, Course) -> Unit = { courseCreate, course ->
            assertTrue(course.id > 0)
            assertTrue(supplementaryRoleService.getRolesByCourse(course).isNotEmpty())
            assertEquals(courseCreate.name, course.name)
            assertEquals(courseCreate.courseCode, course.courseCode)
            assertEquals(courseCreate.externalId, course.externalId)
        }

        // Verify if course creation works as expected
        val course = courseService.createCourse(newCourse.name, newCourse.externalId, newCourse.courseCode)
        asExpected(newCourse, course)

        // Verify if course creation also works if some fields are null
        val newOtherCourse1 = CourseCreateDto("TestCourse4", null, null)
        val otherCourse1 = courseService.createCourse(newOtherCourse1.name,
                newOtherCourse1.externalId, newOtherCourse1.courseCode)
        asExpected(newOtherCourse1, otherCourse1)

        val newOtherCourse2 = CourseCreateDto("TestCourse5", null, "TestCourse5ExternalId")
        val otherCourse2 = courseService.createCourse(newOtherCourse2.name,
                newOtherCourse2.externalId, newOtherCourse2.courseCode)
        asExpected(newOtherCourse2, otherCourse2)

        val newOtherCourse3 = CourseCreateDto("TestCourse6", "TestCourse6CourseCode", null)
        val otherCourse3 = courseService.createCourse(newOtherCourse3.name,
                newOtherCourse3.externalId, newOtherCourse3.courseCode)
        asExpected(newOtherCourse3, otherCourse3)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateCourse() {
        // First create a new course which will be updated afterwards
        val course = courseService.createCourse(newCourse)

        // Define function that asserts whether course update went as expected
        val asExpected: (CourseUpdateDto, Course) -> Unit = { courseUpdate, updatedCourse ->
            assertEquals(course.id, updatedCourse.id)
            assertEquals(course.externalId, updatedCourse.externalId)
            assertEquals(course.createdAt, updatedCourse.createdAt)
            assertEquals(courseUpdate.name, updatedCourse.name)
            assertEquals(courseUpdate.courseCode, updatedCourse.courseCode)
            assertEquals(courseUpdate.archivedAt, updatedCourse.archivedAt)
        }

        // Verify if course update works as expected
        val courseUpdate = CourseUpdateDto("TestCourse01",
                "TestCourse0CourseCode", ZonedDateTime.now())
        val updatedCourse = courseService.updateCourse(course.id, courseUpdate)
        asExpected(courseUpdate, updatedCourse)

        // Verify if course update still works as expected when some fields are null
        val courseUpdate1 = CourseUpdateDto("TestCourse1", null, null)
        val updatedCourse1 = courseService.updateCourse(course.id, courseUpdate1)
        asExpected(courseUpdate1, updatedCourse1)

        val courseUpdate2 = CourseUpdateDto("TestCourse2", null, ZonedDateTime.now())
        val updatedCourse2 = courseService.updateCourse(course.id, courseUpdate2)
        asExpected(courseUpdate2, updatedCourse2)

        val courseUpdate3 = CourseUpdateDto("TestCourse3", "TestCourse3CourseCode", null)
        val updatedCourse3 = courseService.updateCourse(course.id, courseUpdate3)
        asExpected(courseUpdate3, updatedCourse3)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateCourseAlternative() {
        // First create a new course which will be updated afterwards
        val course = courseService.createCourse(newCourse)

        // Define function that asserts whether course update went as expected
        val asExpected: (CourseUpdateDto, Course) -> Unit = { courseUpdate, updatedCourse ->
            assertEquals(course.id, updatedCourse.id)
            assertEquals(course.externalId, updatedCourse.externalId)
            assertEquals(course.createdAt, updatedCourse.createdAt)
            assertEquals(courseUpdate.name, updatedCourse.name)
            assertEquals(courseUpdate.courseCode, updatedCourse.courseCode)
            assertEquals(courseUpdate.archivedAt, updatedCourse.archivedAt)
        }

        // Verify if course update works as expected
        val courseUpdate = CourseUpdateDto("TestCourse01",
                "TestCourse0CourseCode", ZonedDateTime.now())
        val updatedCourse = courseService.updateCourse(course.id, courseUpdate.courseCode,
                courseUpdate.name, courseUpdate.archivedAt)
        asExpected(courseUpdate, updatedCourse)

        // Verify if course update still works as expected when some fields are null
        val courseUpdate1 = CourseUpdateDto("TestCourse1", null, null)
        val updatedCourse1 = courseService.updateCourse(course.id, courseUpdate1.courseCode,
                courseUpdate1.name, courseUpdate1.archivedAt)
        asExpected(courseUpdate1, updatedCourse1)

        val courseUpdate2 = CourseUpdateDto("TestCourse2", null, ZonedDateTime.now())
        val updatedCourse2 = courseService.updateCourse(course.id, courseUpdate2.courseCode,
                courseUpdate2.name, courseUpdate2.archivedAt)
        asExpected(courseUpdate2, updatedCourse2)

        val courseUpdate3 = CourseUpdateDto("TestCourse3", "TestCourse3CourseCode", null)
        val updatedCourse3 = courseService.updateCourse(course.id, courseUpdate3.courseCode,
                courseUpdate3.name, courseUpdate3.archivedAt)
        asExpected(courseUpdate3, updatedCourse3)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetSignOffGroupSearchResults() {
        // TODO
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetSignOffResultsFilteredInCourse() {
        // TODO
    }

}
