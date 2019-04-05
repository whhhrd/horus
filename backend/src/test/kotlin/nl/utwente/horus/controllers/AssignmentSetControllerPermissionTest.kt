package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.assignment.AssignmentSetsController
import nl.utwente.horus.representations.assignment.AssignmentSetUpdateDto
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import javax.servlet.http.HttpServletResponse

class AssignmentSetControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var assignmentSetController: AssignmentSetsController

    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    @Autowired
    lateinit var httpServletResponse: HttpServletResponse

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetFullById() {
        assertInsufficientPermissions { assignmentSetController.getFullById(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetFullById() {
        assertSufficientPermissions { assignmentSetController.getFullById(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetFullById() {
        assertSufficientPermissions { assignmentSetController.getFullById(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetFullById() {
        assertSufficientPermissions { assignmentSetController.getFullById(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAUpdateAssignmentSet() {
        val assignmentSetUpdate = AssignmentSetUpdateDto("UpdatedName", listOf(), listOf())
        assertInsufficientPermissions { assignmentSetController.updateAssignmentSet(
                SS_ASSIGNMENT_SET_ID, assignmentSetUpdate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentUpdateAssignmentSet() {
        val assignmentSetUpdate = AssignmentSetUpdateDto("UpdatedName", listOf(), listOf())
        assertInsufficientPermissions { assignmentSetController.updateAssignmentSet(
                SS_ASSIGNMENT_SET_ID, assignmentSetUpdate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAUpdateAssignmentSet() {
        val assignmentSetUpdate = AssignmentSetUpdateDto("UpdatedName", listOf(), listOf())
        assertInsufficientPermissions { assignmentSetController.updateAssignmentSet(
                SS_ASSIGNMENT_SET_ID, assignmentSetUpdate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherUpdateAssignmentSet() {
        val assignmentSetUpdate = AssignmentSetUpdateDto("UpdatedName", listOf(), listOf())
        assertSufficientPermissions { assignmentSetController.updateAssignmentSet(
                SS_ASSIGNMENT_SET_ID, assignmentSetUpdate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADeleteAssignmentSet() {
        assertInsufficientPermissions { assignmentSetController.deleteAssignmentSet(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDeleteAssignmentSet() {
        assertInsufficientPermissions { assignmentSetController.deleteAssignmentSet(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADeleteAssignmentSet() {
        assertInsufficientPermissions { assignmentSetController.deleteAssignmentSet(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDeleteAssignmentSet() {
        assertSufficientPermissions { assignmentSetController.deleteAssignmentSet(SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetMappedGroups() {
        assertInsufficientPermissions { assignmentSetController.getMappedGroups(
                Pageable.unpaged(), SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetMappedGroups() {
        assertInsufficientPermissions { assignmentSetController.getMappedGroups(
                Pageable.unpaged(), SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetMappedGroups() {
        assertSufficientPermissions { assignmentSetController.getMappedGroups(
                Pageable.unpaged(), SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetMappedGroups() {
        assertSufficientPermissions { assignmentSetController.getMappedGroups(
                Pageable.unpaged(), SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetSetsSheet() {
        assertInsufficientPermissions { assignmentSetController.getSetsSheet(
                listOf(SS_ASSIGNMENT_SET_ID), httpServletResponse) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetSetsSheet() {
        assertInsufficientPermissions { assignmentSetController.getSetsSheet(
                listOf(SS_ASSIGNMENT_SET_ID), httpServletResponse) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetSetsSheet() {
        assertSufficientPermissions { assignmentSetController.getSetsSheet(
                listOf(SS_ASSIGNMENT_SET_ID), httpServletResponse) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetSetsSheet() {
        assertSufficientPermissions { assignmentSetController.getSetsSheet(
                listOf(SS_ASSIGNMENT_SET_ID), httpServletResponse) }
    }

}
