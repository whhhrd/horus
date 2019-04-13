package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.representations.assignment.AssignmentCreateUpdateDto
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.signoff.SignOffService
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class SignOffServiceTest : HorusAbstractTest() {

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var assignmentService: AssignmentService

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
        assertTrue(counts[firstAssignment]!! > counts[lastAssignment]!!)
        assertTrue(counts[newId]!! == 0L)
    }

    private fun createAssignmentSet(): AssignmentSet {
        val set = assignmentService.createAssignmentSet(getPPTeacherParticipant(), getPPCourse(), AssignmentSetCreateDto("set"))
        assignmentService.updateAssignmentSet(getCurrentPerson(), set.id, AssignmentSetUpdateDto("set", listOf(PP_GROUPSET_ID),
                listOf(
                        AssignmentCreateUpdateDto(null, "1.1", true),
                        AssignmentCreateUpdateDto(null, "2.1", true))))
        return set
    }


}
