package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.AssignmentNotFoundException
import nl.utwente.horus.exceptions.AssignmentSetNotFoundException
import nl.utwente.horus.exceptions.InvalidAssignmentUpdateRequestException
import nl.utwente.horus.representations.assignment.AssignmentCreateUpdateDto
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.RoleService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.person.PersonService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class AssignmentServiceTest : HorusAbstractTest() {

    val fpAssignmentSetId = 3L
    val fakeID = 17371238L

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var courseService: CourseService

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var roleService: RoleService

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetAssignmentSetById() {
        // First try if a valid assignment set is retrieved correctly
        val assignmentSet = assignmentService.getAssignmentSetById(fpAssignmentSetId)
        assertEquals("FP questions", assignmentSet.name)

        // Then try to retrieve an assignment set that does not exist
        assertThrows(AssignmentSetNotFoundException::class) { assignmentService.getAssignmentSetById(fakeID) }
    }

    @Test
    @WithLoginId(STUDENT_LOGIN)
    fun testGetAssignmentSetsByParticipant() {
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val assignmentSets = assignmentService.getAssignmentSetsByParticipant(participant)

        // Assert that this participant has the expected number of assignment sets
        assertEquals(4, assignmentSets.size)

        // Check if the assignment sets themselves are as expected
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
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetAssignmentSetsByParticipantPartialCourse() {
        // This intent of this test is to verify whether the getAssignmentSetsByParticipant function also works as
        // expected when a participant only takes part in a non-empty proper subset of the assignment sets of a course.

        // First let the teacher set up the group set
        val teacherParticipant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val ppCourse = courseService.getCourseById(PP_MOCK_COURSE_ID)
        val newGroupSet = groupService.addGroupSet(fakeID.toString(), ppCourse, "GroupSet123", teacherParticipant)

        // Assign the new group set to the FP assignment set
        // Note: this potentially destroys the existing assignments and group sets linked to the assignment set,
        // but that is irrelevant for the sake of this test.
        val assignmentSetUpdate = AssignmentSetUpdateDto("FP exercises", listOf(newGroupSet.id), null)
        assignmentService.updateAssignmentSet(getCurrentPerson(), fpAssignmentSetId, assignmentSetUpdate)

        // Then create a new person and add it to the course
        val newPerson = personService.createPerson("s9128734",
                "Person123 Test", "Person123", "Test, Person123","person123@te.st")
        val newParticipant = participantService.createParticipant(newPerson, ppCourse, roleService.getStudentRole())

        // Check if initially the participant does not participate in any assignment sets
        val initialAssignmentSets = assignmentService.getAssignmentSetsByParticipant(newParticipant)
        assertEquals(0, initialAssignmentSets.size)

        // Subsequently create a new group, to which the participant is added
        val newGroup = groupService.addGroup(newGroupSet, "External123", "Group123", teacherParticipant)
        groupService.addParticipantToGroup(newGroup, newParticipant)

        // Finally check if now the participant does participate in the FP assignment set
        val assignmentSets = assignmentService.getAssignmentSetsByParticipant(newParticipant)
        assertEquals(1, assignmentSets.size)
        assertEquals(fpAssignmentSetId, assignmentSets[0].id)
    }

    @Test
    @WithLoginId(STUDENT_LOGIN)
    fun testGetAssignmentById() {
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)

        // Retrieve the assignment sets of the PP course
        val assignmentSets = assignmentService.getAssignmentSetsByParticipant(participant)

        // Try to retrieve some assignment by ID and check if it is the same as the assignment retrieved in batch
        val someAssignment = assignmentSets[0].assignments.toList()[7]
        val someRetrievedAssignment = assignmentService.getAssignmentById(someAssignment.id)
        assertEquals(someAssignment, someRetrievedAssignment)

        // Try to retrieve another assignment by ID and check if it is the same as the assignment retrieved in batch
        val anotherAssignment = assignmentSets[1].assignments.toList()[15]
        val anotherRetrievedAssignment = assignmentService.getAssignmentById(anotherAssignment.id)
        assertEquals(anotherAssignment, anotherRetrievedAssignment)

        // Try to retrieve an assignment that does not exist
        assertThrows(AssignmentNotFoundException::class) { assignmentService.getAssignmentById(fakeID) }
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testGetAssignmentGroupSetsMappingsInCourse() {
        // First check if initially the PP course has four Assignment Set - Group Set mappings
        val initialMappings = assignmentService.getAssignmentGroupSetsMappingsInCourse(PP_MOCK_COURSE_ID)
        assertEquals(4, initialMappings.size)

        // Then add a mapping, and verify if the mapping is retrieved correctly
        // To do this, first create a group set
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val ppCourse = courseService.getCourseById(PP_MOCK_COURSE_ID)
        val newGroupSet = groupService.addGroupSet(fakeID.toString(), ppCourse, "GroupSet123", participant)

        // Afterwards assign the new group set to the FP assignment set
        // Note: this potentially destroys the existing assignments linked to the assignment set,
        // but that is irrelevant for the sake of this test.
        val oldFpLinkedGroupSet = initialMappings[0].groupSet.id
        val fpLinkedGroupSets = listOf(oldFpLinkedGroupSet, newGroupSet.id)
        val assignmentSetUpdate = AssignmentSetUpdateDto("FP exercises", fpLinkedGroupSets, null)
        assignmentService.updateAssignmentSet(getCurrentPerson(), fpAssignmentSetId, assignmentSetUpdate)

        // Finally check if the mapping can be retrieved as expected
        val mappings = assignmentService.getAssignmentGroupSetsMappingsInCourse(PP_MOCK_COURSE_ID)
        assertEquals(5, mappings.size)
        var found1 = false
        var found2 = false
        for (mapping in mappings) {
            if (mapping.assignmentSet.id == fpAssignmentSetId) {
                if (mapping.groupSet.id == oldFpLinkedGroupSet) {
                    found1 = true
                } else if (mapping.groupSet.id == newGroupSet.id) {
                    found2 = true
                }
            }
        }
        assertTrue(found1 && found2)
    }

    @Test
    @WithLoginId(STUDENT_LOGIN)
    fun testGetAssignmentsByIds() {
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)

        // Retrieve the assignment sets of the PP course
        val assignmentSets = assignmentService.getAssignmentSetsByParticipant(participant)

        // Try to retrieve some assignments by IDs in function call and check if they are retrieved correctly
        val someAssignment = assignmentSets[0].assignments.toList()[7]
        val anotherAssignment = assignmentSets[1].assignments.toList()[15]
        val orderedAssignments = listOf(someAssignment, anotherAssignment).sortedBy { it.orderKey }

        val toBeRetrieved = listOf(someAssignment.id, anotherAssignment.id)
        val retrievedAssignments = assignmentService.getAssignmentsByIds(toBeRetrieved)
        assertEquals(2, retrievedAssignments.size)
        assertEquals(orderedAssignments[0], retrievedAssignments[0])
        assertEquals(orderedAssignments[1], retrievedAssignments[1])

        // Also try to retrieve the assignments belonging to an empty list of assignment IDs
        val noRetrievedAssignments = assignmentService.getAssignmentsByIds(listOf())
        assertEquals(0, noRetrievedAssignments.size)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testCreateAssignmentSet() {
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val ppCourse = courseService.getCourseById(PP_MOCK_COURSE_ID)

        // Create a new assignment set, and check whether it is actually created
        val createAssignmentSet = AssignmentSetCreateDto("NewAssignmentSet312")
        val assignmentSet = assignmentService.createAssignmentSet(participant, ppCourse, createAssignmentSet)
        assertTrue(assignmentSet.id > 0)
        assertEquals(ppCourse, assignmentSet.course)
        assertEquals(createAssignmentSet.name, assignmentSet.name)
        assertEquals(participant, assignmentSet.createdBy)
        assertEquals(0, assignmentSet.assignments.size)
        assertEquals(0, assignmentSet.groupSetMappings.size)

        // Also try if retrieving by a separate call works as intended
        val sameAssignmentSet = assignmentService.getAssignmentSetById(assignmentSet.id)
        assertEquals(assignmentSet, sameAssignmentSet)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetName() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First update the name of the assignment set, keeping the other properties the same
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto)

        val updateAssignmentSet = AssignmentSetUpdateDto("STC-AS-000", groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the name is updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(updateAssignmentSet.name, updatedAssignmentSet.name)

        // And finally check if the mappings to group sets and the assignments are unchanged
        verifyEqualElements(assignmentSet.groupSetMappings, updatedAssignmentSet.groupSetMappings)
        verifyEqualElements(assignmentSet.assignments, updatedAssignmentSet.assignments)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentMilestone() {
        val (_, _, set) = createSampleTestAssignmentSet()
        val first = set.assignments.first()
        val oldMilestone = first.milestone
        val newMilestone = !oldMilestone
        val dto = AssignmentCreateUpdateDto(first.id, first.name, newMilestone)

        // Reconstruct DTO update for whole set, except for first assignment
        val groupSetIDs = set.groupSetMappings.map { it.groupSet.id }
        val assignments = listOf(dto) + set.assignments.drop(1).map(this::assignmentToCreateUpdateDto)

        val updateAssignmentSet = AssignmentSetUpdateDto(set.name , groupSetIDs, assignments)
        assignmentService.updateAssignmentSet(
                getCurrentPerson(), set.id, updateAssignmentSet)


        assertEquals(newMilestone, assignmentService.getAssignmentById(first.id).milestone)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetNameEmpty() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First update the name of the assignment set to be empty, keeping the other properties the same
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto)

        val updateAssignmentSet = AssignmentSetUpdateDto("", groupSetIDs, assignments)
        assertThrows(InvalidAssignmentUpdateRequestException::class) { assignmentService.updateAssignmentSet(creatorPerson, assignmentSet.id, updateAssignmentSet) }

        // Then check if the assignment set is not updated
        val updatedAssignmentSet = assignmentService.getAssignmentSetById(assignmentSet.id)
        assertEquals(assignmentSet, updatedAssignmentSet)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetAddGroupSet() {
        val creatorPerson = getCurrentPerson()
        val (course, participant, assignmentSet) = createSampleTestAssignmentSet()

        // First create a new group set and link it to the assignment set
        val newGroupSet = groupService.addGroupSet("STC-EID-111", course, "STC-GS-111", participant)
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }.toMutableList()
        groupSetIDs.add(newGroupSet.id)
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto)

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the group sets are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(groupSetIDs.toSet(), updatedAssignmentSet.groupSetMappings.map { it.groupSet.id }.toSet())

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.assignments, updatedAssignmentSet.assignments)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetDeleteGroupSet() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First remove one of the group sets from the assignment set mapping
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }.toMutableList()
        groupSetIDs.remove(0)
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto)

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the group sets are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(groupSetIDs.toSet(), updatedAssignmentSet.groupSetMappings.map { it.groupSet.id }.toSet())

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.assignments, updatedAssignmentSet.assignments)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetReplaceGroupSet() {
        val creatorPerson = getCurrentPerson()
        val (course, participant, assignmentSet) = createSampleTestAssignmentSet()

        // First remove one of the group sets from the assignment set mapping
        // and create a new group set and link it to the assignment set.
        val newGroupSet = groupService.addGroupSet("STC-EID-111", course, "STC-GS-111", participant)
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }.toMutableList()
        groupSetIDs.removeAt(0)
        groupSetIDs.add(newGroupSet.id)
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto)

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the group sets are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(groupSetIDs.toSet(), updatedAssignmentSet.groupSetMappings.map { it.groupSet.id }.toSet())

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.assignments, updatedAssignmentSet.assignments)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetEmptyGroupSet() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // Update the assignment set such that no group sets are linked to it
        val groupSetIDs = listOf<Long>()
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto)

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the group sets are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(groupSetIDs.toSet(), updatedAssignmentSet.groupSetMappings.map { it.groupSet.id }.toSet())

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.assignments, updatedAssignmentSet.assignments)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetAddAssignment() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First add a new assignment to the assignment set
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto).toMutableList()
        assignments.add(AssignmentCreateUpdateDto(null, "STC-ASS-111", false))

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the assignments are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(assignments.map { it.name }.toSet(), updatedAssignmentSet.assignments.map { it.name }.toSet())
        for (assignment in assignmentSet.assignments) {
            var found = false
            for (updatedAssignment in updatedAssignmentSet.assignments) {
                if (assignment == updatedAssignment) {
                    found = true
                }
            }
            assertTrue(found)
        }
        assertEquals(assignments.size, updatedAssignmentSet.assignments.size)

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.groupSetMappings, updatedAssignmentSet.groupSetMappings)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetDeleteAssignment() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First delete an assignment from the assignment set
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto).toMutableList()
        assignments.removeAt(0)

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the assignments are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(assignments.map { it.name }.toSet(), updatedAssignmentSet.assignments.map { it.name }.toSet())
        for (assignment in assignmentSet.assignments) {
            var found = false
            for (updatedAssignment in updatedAssignmentSet.assignments) {
                if (assignment == updatedAssignment) {
                    found = true
                }
            }
            assertTrue(found)
        }
        assertEquals(assignments.size, updatedAssignmentSet.assignments.size)

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.groupSetMappings, updatedAssignmentSet.groupSetMappings)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetReplaceAssignment() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First delete an assignment from the assignment set and add a new assignment to the assignment set
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto).toMutableList()
        assignments.removeAt(0)
        assignments.add(AssignmentCreateUpdateDto(null, "STC-ASS-111", false))

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the assignments are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(assignments.map { it.name }.toSet(), updatedAssignmentSet.assignments.map { it.name }.toSet())
        for (assignment in assignmentSet.assignments) {
            var found = false
            for (updatedAssignment in updatedAssignmentSet.assignments) {
                if (assignment == updatedAssignment) {
                    found = true
                }
            }
            assertTrue(found)
        }
        assertEquals(assignments.size, updatedAssignmentSet.assignments.size)

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.groupSetMappings, updatedAssignmentSet.groupSetMappings)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetAddEmptyNameAssignment() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First add an assignment with an empty name to the assignment set
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }
        val assignments = assignmentSet.assignments.map(this::assignmentToCreateUpdateDto).toMutableList()
        assignments.add(AssignmentCreateUpdateDto(null, "", false))

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        assertThrows(InvalidAssignmentUpdateRequestException::class) { assignmentService.updateAssignmentSet(creatorPerson, assignmentSet.id, updateAssignmentSet) }

        // Then check if the assignment set is not updated
        val updatedAssignmentSet = assignmentService.getAssignmentSetById(assignmentSet.id)
        assertEquals(assignmentSet, updatedAssignmentSet)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testUpdateAssignmentSetEmptyAssignments() {
        val creatorPerson = getCurrentPerson()
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()

        // First delete an assignment from the assignment set and add a new assignment to the assignment set
        val groupSetIDs = assignmentSet.groupSetMappings.map { it.groupSet.id }
        val assignments = listOf<AssignmentCreateUpdateDto>()

        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        val updatedAssignmentSet = assignmentService.updateAssignmentSet(
                creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Then check if the assignments are updated correctly
        assertEquals(assignmentSet.id, updatedAssignmentSet.id)
        assertEquals(assignments.map { it.name }.toSet(), updatedAssignmentSet.assignments.map { it.name }.toSet())
        for (assignment in assignmentSet.assignments) {
            var found = false
            for (updatedAssignment in updatedAssignmentSet.assignments) {
                if (assignment == updatedAssignment) {
                    found = true
                }
            }
            assertTrue(found)
        }
        assertEquals(assignments.size, updatedAssignmentSet.assignments.size)

        // And finally check if the other fields remain unchanged
        assertEquals(assignmentSet.name, updatedAssignmentSet.name)
        verifyEqualElements(assignmentSet.groupSetMappings, updatedAssignmentSet.groupSetMappings)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testIsPersonMappedToAssignmentSet() {
        // First check if initially the person is not mapped to the assignment set
        val (course, creatorParticipant, assignmentSet) = createSampleTestAssignmentSet()
        val person = personService.createPerson("s9128734",
                "Person123 Test", "Person123", "Test, Person123", "person123@te.st")
        assertFalse(assignmentService.isPersonMappedToAssignmentSet(person, assignmentSet))

        // Then add the person to the course, and check if it is still not mapped to the assignment set
        val participant = participantService.createParticipant(person, course, roleService.getStudentRole())
        assertFalse(assignmentService.isPersonMappedToAssignmentSet(person, assignmentSet))

        // Finally check if after assigning the person to a group set linked to an assignment set,
        // that person then is mapped to the assignment set.
        val groupSet = assignmentSet.groupSetMappings.toList()[0].groupSet
        val group = groupService.addGroup(groupSet, null, "STC-GR-999", creatorParticipant)
        groupService.addParticipantToGroup(group, participant)
        assertTrue(assignmentService.isPersonMappedToAssignmentSet(person, assignmentSet))
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testAddThreadToAssignment() {
        val (_, _, assignmentSet) = createSampleTestAssignmentSet()
        val assignment = assignmentSet.assignments.toList()[0]
        val thread = commentService.createThread(CommentType.STAFF_ONLY,
                "This is message :)", getCurrentPerson())

        // Check if initially the thread is not linked to the assignment
        assertNull(assignment.commentThread)

        // But that after linking it, it is actually linked
        assignmentService.addThreadToAssignment(assignment, thread)
        val updatedAssignment = assignmentService.getAssignmentById(assignment.id)
        assertEquals(thread, updatedAssignment.commentThread)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testDeleteAssignmentSet() {
        // First delete an assignment set containing several of assignments
        val fpAssignmentSet = assignmentService.getAssignmentSetById(fpAssignmentSetId)
        assignmentService.deleteAssignmentSet(fpAssignmentSet)
        // Then try to retrieve the deleted assignment set again (which should fail)
        assertThrows(AssignmentSetNotFoundException::class) { assignmentService.getAssignmentSetById(fpAssignmentSetId) }

        // Then try to delete an assignment set containing no exercises
        // To do this, first create an assignment set with no assignments assigned to it
        val newCourse = CourseCreateDto("SampleTestCourse", "STC-CC-999", "STC-EID-999")
        val course = courseService.createCourse(newCourse)
        val participant = participantService.createParticipant(getCurrentPerson(), course, roleService.getTeacherRole())
        val newEmptyAssignmentSet = AssignmentSetCreateDto("STC-AS-999")
        val emptyAssignmentSet = assignmentService.createAssignmentSet(participant, course, newEmptyAssignmentSet)

        // Afterwards, delete this assignment set
        assignmentService.deleteAssignmentSet(emptyAssignmentSet)
        // Then again, try to retrieve the deleted assignment set again
        assertThrows(AssignmentSetNotFoundException::class) { assignmentService.getAssignmentSetById(emptyAssignmentSet.id) }
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testDeleteAssignment() {
        val set = assignmentService.getAssignmentSetById(fpAssignmentSetId)

        // Define a local function that verifies whether a given assignment set contains an assignment
        val containsAssignment: (AssignmentSet, Assignment) -> Boolean = { assignmentSet, assignment ->
            var found = false
            for (otherAssignment in assignmentSet.assignments) {
                if (assignment.id == otherAssignment.id) {
                    found = true
                }
            }
            found
        }
        val assignments = set.assignments
        var oldSize = assignments.size
        // Keep deleting random element from set, until it is empty
        while (assignments.isNotEmpty()) {
            val toDelete = assignments.first()
            assignmentService.deleteAssignment(toDelete)

            // Verify whether or not all traces are deleted
            assertEquals(--oldSize, assignments.size)
            assertFalse(containsAssignment(set, toDelete))
            assertThrows(AssignmentNotFoundException::class) { assignmentService.getAssignmentById(toDelete.id) }
        }
    }

    private fun <T> verifyEqualElements(set1: Set<T>, set2: Set<T>) {
        // Helper function used to verify whether two sets contain the same elements.
        // Note: requires elements in the set to be unique in said set.
        assertEquals(set1.size, set2.size)
        for (mapping in set1) {
            var found = false
            for (updatedMapping in set2) {
                if (mapping == updatedMapping) {
                    found = true
                }
            }
            assertTrue(found)
        }
    }

    private fun createSampleTestAssignmentSet(): Triple<Course, Participant, AssignmentSet> {
        // Helper function used to create a sample assignment set
        val creatorPerson = getCurrentPerson()

        // Create a new course, participant and assignment set and link them
        val newCourse = CourseCreateDto("SampleTestCourse", "STC-CC-999", "STC-EID-999")
        val course = courseService.createCourse(newCourse)
        val participant = participantService.createParticipant(creatorPerson, course, roleService.getTeacherRole())
        val newAssignmentSet = AssignmentSetCreateDto("STC-AS-999")
        val assignmentSet = assignmentService.createAssignmentSet(participant, course, newAssignmentSet)

        // Also create group sets and assignments, and add them to the assignment set
        val groupSet1 = groupService.addGroupSet("STC-EID-999", course, "STC-GS-999", participant)
        val groupSet2 = groupService.addGroupSet("STC-EID-000", course, "STC-GS-000", participant)
        val groupSetIDs = listOf(groupSet1.id, groupSet2.id)
        val assignment1 = AssignmentCreateUpdateDto(null, "STC-ASS-999", true)
        val assignment2 = AssignmentCreateUpdateDto(null, "STC-ASS-000", false)
        val assignments = listOf(assignment1, assignment2)
        val updateAssignmentSet = AssignmentSetUpdateDto(assignmentSet.name, groupSetIDs, assignments)
        assignmentService.updateAssignmentSet(creatorPerson, assignmentSet.id, updateAssignmentSet)

        // Verify that the assignment set is successfully created
        val updatedAssignmentSet = assignmentService.getAssignmentSetById(assignmentSet.id)
        assertTrue(updatedAssignmentSet.id > 0)
        assertEquals(newAssignmentSet.name, updatedAssignmentSet.name)
        assertEquals(course, updatedAssignmentSet.course)
        assertEquals(participant, updatedAssignmentSet.createdBy)
        verifyEqualElements(groupSetIDs.toSet(), updatedAssignmentSet.groupSetMappings.map { it.groupSet.id }.toSet())
        verifyEqualElements(assignments.map { it.name }.toSet(),
                updatedAssignmentSet.assignments.map { it.name }.toSet())

        // Return the created course, participant and assignment set in the form of a triple
        return Triple(course, participant, updatedAssignmentSet)
    }

    private fun assignmentToCreateUpdateDto(a: Assignment): AssignmentCreateUpdateDto {
        return AssignmentCreateUpdateDto(a.id, a.name, a.milestone)
    }

}
