package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.exceptions.CourseMismatchException
import nl.utwente.horus.exceptions.SignOffResultNotFoundException
import nl.utwente.horus.representations.assignment.AssignmentCreateUpdateDto
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.participant.ParticipantCreateDto
import nl.utwente.horus.representations.signoff.SignOffResultArchiveDto
import nl.utwente.horus.representations.signoff.SignOffResultCreateDto
import nl.utwente.horus.representations.signoff.SignOffResultPatchDto
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import nl.utwente.horus.services.signoff.SignOffService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class SignOffServiceTest : HorusAbstractTest() {

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var groupService: GroupService

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testHasSignOffsFilled() {
        val assignmentIds = getPPCourse().assignmentSets.first().assignments.take(5)
        val counts = signOffService.getSignOffResultCounts(assignmentIds.map { it.id })
        assertEquals(assignmentIds.size, counts.size)
        assignmentIds.forEach {assignment ->
            assertTrue(assignment in counts.keys)
            assertTrue(counts.getValue(assignment) > 0) // All initial assignments have sign-offs
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testHasSignOffsEmpty() {
        val set = createAssignmentSet()
        val assignmentIds = set.assignments.map { it.id }
        val counts = signOffService.getSignOffResultCounts(assignmentIds)
        assertEquals(assignmentIds.size, counts.size)
        assertTrue(counts.values.all { it == 0L })
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testHasSignOffsMixed() {
        val firstAssignment = CC_ASSIGNMENT_IDS.first()
        val lastAssignment = CC_ASSIGNMENT_IDS.last()
        val newId = createAssignmentSet().assignments.first().id
        val assignmentIds = listOf(firstAssignment, newId, lastAssignment)
        val counts = signOffService.getSignOffResultCounts(assignmentIds).mapKeys { it.key.id }
        assertEquals(assignmentIds.size, counts.size)
        assertTrue(counts.getValue(firstAssignment) > counts.getValue(lastAssignment))
        assertTrue(counts.getValue(newId) == 0L)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSignOffById() {
        assertThrows(SignOffResultNotFoundException::class) { signOffService.getSignOffResultById(Long.MAX_VALUE) }
        assertEquals(PP_SIGN_OFF_RESULT_IDS.first(), signOffService.getSignOffResultById(PP_SIGN_OFF_RESULT_IDS.first()).id)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSignOffResults() {
        val signoffs = signOffService.getGroupAssignmentSetSignOffResults(
                getPPCourse().groupSets.first().groups.first(),
                getPPCourse().assignmentSets.first())
        assertTrue(signoffs.all { it.assignment.assignmentSet == getPPCourse().assignmentSets.first()
                && getPPCourse().groupSets.first().groups.first().participants.contains(it.participant)})
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAssignmentSignOffResults() {
        val signoffs = signOffService.getAssignmentSignOffResults((getPPCourse().assignmentSets.first().assignments.first()))
        assertTrue(signoffs.all { it.assignment == getPPCourse().assignmentSets.first().assignments.first() })
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSignOffResultCountsOld() {
        assertEquals(emptyMap<Assignment, Long>(), signOffService.getSignOffResultCounts(emptyList()))
        val signoffCounts = signOffService.getSignOffResultCounts(CC_ASSIGNMENT_IDS.toList())
        assertTrue(signoffCounts.all { it.value == signOffService.getAssignmentSignOffResults(it.key).size.toLong() })
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testProcessSignOffsIncorrectParticipant() {
        val newCourse = courseService.createCourse(CourseCreateDto("test", null, null))
        //Get a student from PP
        val participant = getPPCourse().enabledParticipants.firstOrNull { it.role.id == 1L }!!
        //Use as student in the new course
        val newParticipant = participantService.createParticipant(newCourse.id, ParticipantCreateDto(participant.person.id, 1L))
        //Try to create a signoff using the participantId of the other course
        val createDtoUnmatchingCourses = SignOffResultCreateDto(getPPCourse().assignmentSets.first().assignments.first().id,
                newParticipant.id,
                SignOffResultType.COMPLETE, null)
        assertThrows(CourseMismatchException::class) {
            signOffService.processSignOffs(SignOffResultPatchDto(listOf(createDtoUnmatchingCourses), emptyList()),
                    getPPCourse().assignmentSets.first().id)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testProcessSignOffsEmpty() {
        assertEquals(emptyList<SignOffResult>(), signOffService.processSignOffs(SignOffResultPatchDto(emptyList(),
                emptyList()), getPPCourse().assignmentSets.first().id))
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testProcessSignOffsCreateWithComment() {
        //Create mock data
        val course = courseService.createCourse("test-course", null, null)
        val teacher = participantService.createParticipant(getCurrentPerson(), course, roleService.getTeacherRole())
        val student = participantService.createParticipant(personService.createPerson("testperson2", "testperson2", "testperson2", "testperson1", "test@person2.com"),
                course, roleService.getStudentRole())
        var assignmentSet = assignmentService.createAssignmentSet(teacher, course, AssignmentSetCreateDto(
                "testset"))
        assignmentSet = assignmentService.updateAssignmentSet(teacher.person, assignmentSet.id, AssignmentSetUpdateDto(
                "testset", emptyList(), listOf(AssignmentCreateUpdateDto(null, "assignment", false))
        ) )
        // Create signoff
        signOffService.processSignOffs(SignOffResultPatchDto(listOf(SignOffResultCreateDto(
            assignmentSet.assignments.find { it.name == "assignment" }!!.id, student.id, SignOffResultType.COMPLETE, "test")
        ), emptyList()), assignmentSet.id)
        //Retrieve signoff
        val signOff = signOffService.getAssignmentSignOffResults(assignmentSet.assignments.find { it.name == "assignment" }!!)
        //Check signoff list
        assertNotNull(signOff)
        assertEquals(1, signOff.size)
        //Check comment
        assertNotNull(signOff.first().commentThread)
        assertNotNull(commentService.getThreadById(signOff.first().commentThread!!.id))
        assertEquals(1, commentService.getThreadById(signOff.first().commentThread!!.id).comments.size)
        assertEquals("test", commentService.getThreadById(signOff.first().commentThread!!.id).comments.first().content)
        //Check signoff result
        assertEquals(SignOffResult(signOff.first().id, student, assignmentSet.assignments.find { it.name == "assignment" }!!,
                commentService.getThreadById(signOff.first().commentThread!!.id), SignOffResultType.COMPLETE,
                teacher, signOff.first().signedAt, null, null),
                signOff.first())
        }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testProcessSignOffsDeleteWithComment() {
        //Create mock data
        val course = courseService.createCourse("test-course", null, null)
        val teacher = participantService.createParticipant(getCurrentPerson(), course, roleService.getTeacherRole())
        val student = participantService.createParticipant(personService.createPerson("testperson2", "testperson2", "testperson2", "testperson1", "test@person1.com"),
                course, roleService.getStudentRole())
        var assignmentSet = assignmentService.createAssignmentSet(teacher, course, AssignmentSetCreateDto(
                "testset"))
        assignmentSet = assignmentService.updateAssignmentSet(teacher.person, assignmentSet.id, AssignmentSetUpdateDto(
                "testset", emptyList(), listOf(AssignmentCreateUpdateDto(null, "assignment", false))
        ) )
        // Create signoff
        signOffService.processSignOffs(SignOffResultPatchDto(listOf(SignOffResultCreateDto(
                assignmentSet.assignments.find { it.name == "assignment" }!!.id, student.id, SignOffResultType.COMPLETE, "test")
        ), emptyList()), assignmentSet.id)
        //Retrieve signoff
        val signOff = signOffService.getAssignmentSignOffResults(assignmentSet.assignments.find { it.name == "assignment" }!!)
        //Delete signoff
        signOffService.deleteSignOffResult(signOff.first())
        //Retrieve again
        val deletedSignOff = signOffService.getAssignmentSignOffResults(assignmentSet.assignments.find { it.name == "assignment" }!!)
        //Check that it disappeared
        assertNotNull(deletedSignOff)
        assertEquals(0, deletedSignOff.size)
        //Check that it was not archived
        assertThrows(SignOffResultNotFoundException::class) { signOffService.getSignOffResultById(signOff.first().id) }
        //Check that the commentThread is deleted
        assertThrows(CommentThreadNotFoundException::class) { commentService.getThreadById(signOff.first().commentThread!!.id) }
    }

    private fun createAssignmentSet(): AssignmentSet {
        val set = assignmentService.createAssignmentSet(getPPTeacherParticipant(), getPPCourse(), AssignmentSetCreateDto("set"))
        assignmentService.updateAssignmentSet(getCurrentPerson(), set.id, AssignmentSetUpdateDto("set", listOf(PP_GROUPSET_ID),
                listOf(
                        AssignmentCreateUpdateDto(null, "1.1", true),
                        AssignmentCreateUpdateDto(null, "2.1", true))))
        return set
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSignOffResultById() {
        val (_, _, signOffResults) = createSampleSignOffs(getCurrentPerson())
        for (expectedResult in signOffResults) {
            val actualResult = signOffService.getSignOffResultById(expectedResult.id)
            assertEquals(expectedResult, actualResult)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetGroupAssignmentSetSignOffResults() {
        val (group, assignmentSet, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val retrievedSignOffResults = signOffService.getGroupAssignmentSetSignOffResults(group, assignmentSet)
        assertEquals(signOffResults.toSet(), retrievedSignOffResults.toSet())
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSignOffResultCounts() {
        val (_, assignmentSet, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val counts = signOffService.getSignOffResultCounts(signOffResults.map { it.assignment.id })

        val expectedAssignments = assignmentSet.assignments.filter { it.name.contains("1") }
        assertEquals(expectedAssignments.size, counts.size)
        for (assignment in expectedAssignments) {
            assertEquals(2, counts.getValue(assignment))
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetAssignmentSignOffResults() {
        val (_, assignmentSet, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val expectedResults = signOffResults.filter { it.assignment.name == "1a" }
        val actualResults = signOffService.getAssignmentSignOffResults(
                assignmentSet.assignments.filter { it.name == "1a" }[0])
        assertEquals(expectedResults.toSet(), actualResults.toSet())
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetAssignmentSetSignOffResults() {
        val (_, assignmentSet, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val actualResults = signOffService.getAssignmentSetSignOffResults(assignmentSet)
        assertEquals(signOffResults.toSet(), actualResults.toSet())
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSignOffHistory() {
        val (_, _, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val expectedResult = signOffResults.filter { it.assignment.name == "1a" }[0]
        val actualResults = signOffService.getSignOffHistory(expectedResult.participant.id, expectedResult.assignment.id)
        assertEquals(1, actualResults.size)
        assertEquals(expectedResult, actualResults[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetUnarchivedByParticipantAndAssignmentSet() {
        val (group, assignmentSet, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val participant = group.participants[0]
        val expectedResults: List<SignOffResultType?> = signOffResults.filter { it.participant == participant }
                .map { it.result } + listOf(null, null)
        val actualResults = signOffService.getUnarchivedByParticipantAndAssignmentSet(participant, assignmentSet)
        assertEquals(expectedResults, actualResults)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetUnarchivedSignOffsByParticipant() {
        val (group, _, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val participant = group.participants[0]
        val expectedResults = signOffResults.filter { it.participant == participant }
        val actualResults = signOffService.getUnarchivedSignOffsByParticipant(participant)
        assertEquals(expectedResults.toSet(), actualResults.toSet())
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testProcessSignOffResults() {
        val (group, assignmentSet, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val participant = group.participants[0]
        assertEquals(0, signOffResults.filter { it.participant == participant
                && it.assignment.name == "2a" }.size)
        assertEquals(1, signOffResults.filter { it.participant == participant
                && it.assignment.name == "1a" }.size)

        val newSignOff = SignOffResultCreateDto(assignmentSet.assignments.filter { it.name == "2a" }[0].id,
                participant.id, SignOffResultType.COMPLETE, null)
        val archivedSignOff = SignOffResultArchiveDto(signOffResults.filter { it.participant.id == participant.id &&
                it.assignment.name == "1a" }[0].id,
                null)
        signOffService.processSignOffs(SignOffResultPatchDto(listOf(newSignOff), listOf(archivedSignOff)),
                assignmentSet.id)
        val newSignOffResults = signOffService.getGroupAssignmentSetSignOffResults(group, assignmentSet)
        assertEquals(1, newSignOffResults.filter { it.participant == participant
                && it.assignment.name == "2a" }.size)
        assertEquals(0, newSignOffResults.filter { it.participant == participant
                && it.assignment.name == "1a" }.size)
        assertEquals(signOffResults.filter { it.participant == participant && it.assignment.name == "1b" }[0],
                newSignOffResults.filter { it.participant == participant && it.assignment.name == "1b" }[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAddThreadToSignOffResult() {
        val (_, _, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val signOffResult = signOffResults.filter { it.commentThread == null }[0]
        val commentThread = commentService.createThread(CommentType.STAFF_ONLY, "Message",
                participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID))
        signOffService.addThreadToSignOffResult(signOffResult, commentThread)
        val newSignOffResult = signOffService.getSignOffResultById(signOffResult.id)
        assertEquals(commentThread, newSignOffResult.commentThread)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteSignOffResult() {
        val (_, _, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val deletedSignOffResultId = signOffResults[0].id
        signOffService.deleteSignOffResult(signOffResults[0])
        assertThrows(SignOffResultNotFoundException::class) {
            signOffService.getSignOffResultById(deletedSignOffResultId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSignOffResultsFilteredInCourse() {
        // Note: actually tests the function getSignOffResultsFilteredInCourse of CourseService.
        val (group, assignmentSet, signOffResults) = createSampleSignOffs(getCurrentPerson())
        val actualSignOffResults =
                courseService.getSignOffResultsFilteredInCourse(PP_MOCK_COURSE_ID, group.id, assignmentSet.id)
        assertEquals(signOffResults.toSet(), actualSignOffResults.toSet())
    }


    private fun createSampleSignOffs(creatorPerson: Person): Triple<Group, AssignmentSet, List<SignOffResult>> {
        val creator = participantService.getParticipationInCourse(creatorPerson, PP_MOCK_COURSE_ID)
        val groupSet = groupService.addGroupSet("ExternalID987", getPPCourse(), "GroupSet", creator)
        val group = groupService.addGroup(groupSet, "ExID512-256", "Group", creator)
        val person1 = personService.createPerson("person1",
                "Alice", "Alice", "Alice", "alice@person.edu")
        val person2 = personService.createPerson("person2",
                "Bob", "Bob", "Bob", "bob@person.edu")
        val participant1 = participantService.createParticipant(person1, getPPCourse(), roleService.getStudentRole())
        val participant2 = participantService.createParticipant(person2, getPPCourse(), roleService.getStudentRole())
        groupService.addParticipantToGroup(group, participant1)
        groupService.addParticipantToGroup(group, participant2)

        val assignmentSet = assignmentService.createAssignmentSet(creator,
                getPPCourse(), AssignmentSetCreateDto("AssSet"))
        val assignmentCreates = listOf(
                AssignmentCreateUpdateDto(null, "1a", false),
                AssignmentCreateUpdateDto(null, "1b", false),
                AssignmentCreateUpdateDto(null, "1c", true),
                AssignmentCreateUpdateDto(null, "2a", false),
                AssignmentCreateUpdateDto(null, "2b", true)
        )
        assignmentService.updateAssignmentSet(creatorPerson, assignmentSet.id, AssignmentSetUpdateDto(
                "AssSet", listOf(groupSet.id), assignmentCreates))

        val signOffResultCreates = listOf(
                SignOffResultCreateDto(assignmentSet.assignments.filter { it.name == "1a" }[0].id,
                        participant1.id, SignOffResultType.COMPLETE, null),
                SignOffResultCreateDto(assignmentSet.assignments.filter { it.name == "1b" }[0].id,
                        participant1.id, SignOffResultType.COMPLETE, null),
                SignOffResultCreateDto(assignmentSet.assignments.filter { it.name == "1c" }[0].id,
                        participant1.id, SignOffResultType.COMPLETE, null),
                SignOffResultCreateDto(assignmentSet.assignments.filter { it.name == "1a" }[0].id,
                        participant2.id, SignOffResultType.COMPLETE, null),
                SignOffResultCreateDto(assignmentSet.assignments.filter { it.name == "1b" }[0].id,
                        participant2.id, SignOffResultType.COMPLETE, null),
                SignOffResultCreateDto(assignmentSet.assignments.filter { it.name == "1c" }[0].id,
                        participant2.id, SignOffResultType.INSUFFICIENT, "Incorrect edge case handling.")
        )
        val signOffs = signOffService.processSignOffs(
                SignOffResultPatchDto(signOffResultCreates, listOf()), assignmentSet.id)

        return Triple(group, assignmentSet, signOffs)
    }

}
