package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.course.CourseController
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.representations.assignment.AssignmentSetCreateDto
import nl.utwente.horus.representations.auth.SupplementaryRoleCreateUpdateDto
import nl.utwente.horus.representations.course.CourseCreateDto
import nl.utwente.horus.representations.course.CourseUpdateDto
import nl.utwente.horus.representations.participant.LabelCreateUpdateDto
import nl.utwente.horus.representations.participant.ParticipantCreateDto
import nl.utwente.horus.representations.participant.ParticipantUpdateDto
import org.springframework.beans.factory.annotation.Autowired
import org.junit.Test
import org.springframework.data.domain.Pageable
import javax.servlet.http.HttpServletResponse

class CourseControllerPermissionTest : HorusAbstractTest() {

    @Autowired
    lateinit var courseController: CourseController

    @Suppress("SpringJavaInjectionPointsAutowiringInspection")
    @Autowired
    lateinit var httpServletResponse: HttpServletResponse

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAListCourses() {
        assertSufficientPermissions { courseController.listCourses() }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentListCourses() {
        assertSufficientPermissions { courseController.listCourses() }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAListCourses() {
        assertSufficientPermissions { courseController.listCourses() }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherListCourses() {
        assertSufficientPermissions { courseController.listCourses() }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateCourse() {
        // TODO: Adapt for global permissions
        val courseCreate = CourseCreateDto("TestCourse", null, null)
        assertSufficientPermissions { courseController.createCourse(courseCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateCourse() {
        // TODO: Adapt for global permissions
        val courseCreate = CourseCreateDto("TestCourse", null, null)
        assertSufficientPermissions { courseController.createCourse(courseCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateCourse() {
        // TODO: Adapt for global permissions
        val courseCreate = CourseCreateDto("TestCourse", null, null)
        assertSufficientPermissions { courseController.createCourse(courseCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateCourse() {
        // TODO: Adapt for global permissions
        val courseCreate = CourseCreateDto("TestCourse", null, null)
        assertSufficientPermissions { courseController.createCourse(courseCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAUpdateCourse() {
        val courseUpdate = CourseUpdateDto("UpdatedCourse", null, null)
        assertInsufficientPermissions { courseController.updateCourse(SS_MOCK_COURSE_ID, courseUpdate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentUpdateCourse() {
        val courseUpdate = CourseUpdateDto("UpdatedCourse", null, null)
        assertInsufficientPermissions { courseController.updateCourse(SS_MOCK_COURSE_ID, courseUpdate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAUpdateCourse() {
        val courseUpdate = CourseUpdateDto("UpdatedCourse", null, null)
        assertInsufficientPermissions { courseController.updateCourse(SS_MOCK_COURSE_ID, courseUpdate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherUpdateCourse() {
        val courseUpdate = CourseUpdateDto("UpdatedCourse", null, null)
        assertSufficientPermissions { courseController.updateCourse(SS_MOCK_COURSE_ID, courseUpdate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAListAssignmentSetsOfCourse() {
        assertInsufficientPermissions { courseController.listAssignmentSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentListAssignmentSetsOfCourse() {
        assertSufficientPermissions { courseController.listAssignmentSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAListAssignmentSetsOfCourse() {
        assertSufficientPermissions { courseController.listAssignmentSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherListAssignmentSetsOfCourse() {
        assertSufficientPermissions { courseController.listAssignmentSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateAssignmentSetsInCourse() {
        val assignmentSetCreate = AssignmentSetCreateDto("NewAssignmentSet")
        assertInsufficientPermissions { courseController.createAssignmentSetsInCourse(
                SS_MOCK_COURSE_ID, assignmentSetCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateAssignmentSetsInCourse() {
        val assignmentSetCreate = AssignmentSetCreateDto("NewAssignmentSet")
        assertInsufficientPermissions { courseController.createAssignmentSetsInCourse(
                SS_MOCK_COURSE_ID, assignmentSetCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateAssignmentSetsInCourse() {
        val assignmentSetCreate = AssignmentSetCreateDto("NewAssignmentSet")
        assertInsufficientPermissions { courseController.createAssignmentSetsInCourse(
                SS_MOCK_COURSE_ID, assignmentSetCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateAssignmentSetsInCourse() {
        val assignmentSetCreate = AssignmentSetCreateDto("NewAssignmentSet")
        assertSufficientPermissions { courseController.createAssignmentSetsInCourse(
                SS_MOCK_COURSE_ID, assignmentSetCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAListGroupSetsOfCourse() {
        assertInsufficientPermissions { courseController.listGroupSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentListGroupSetsOfCourse() {
        assertInsufficientPermissions { courseController.listGroupSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAListGroupSetsOfCourse() {
        assertSufficientPermissions { courseController.listGroupSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherListGroupSetsOfCourse() {
        assertSufficientPermissions { courseController.listGroupSetsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAListAssignmentGroupSetsMappings() {
        assertInsufficientPermissions { courseController.listAssignmentGroupSetsMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentListAssignmentGroupSetsMappings() {
        assertInsufficientPermissions { courseController.listAssignmentGroupSetsMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAListAssignmentGroupSetsMappings() {
        assertSufficientPermissions { courseController.listAssignmentGroupSetsMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherListAssignmentGroupSetsMappings() {
        assertSufficientPermissions { courseController.listAssignmentGroupSetsMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAListParticipantsOfCourse() {
        assertInsufficientPermissions { courseController.listParticipantsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentListParticipantsOfCourse() {
        assertInsufficientPermissions { courseController.listParticipantsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAListParticipantsOfCourse() {
        assertSufficientPermissions { courseController.listParticipantsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherListParticipantsOfCourse() {
        assertSufficientPermissions { courseController.listParticipantsOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetCurrentParticipantInCourse() {
        assertInsufficientPermissions { courseController.getCurrentParticipantInCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetCurrentParticipantInCourse() {
        assertSufficientPermissions { courseController.getCurrentParticipantInCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetCurrentParticipantInCourse() {
        assertSufficientPermissions { courseController.getCurrentParticipantInCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetCurrentParticipantInCourse() {
        assertSufficientPermissions { courseController.getCurrentParticipantInCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAListStaffOfCourse() {
        assertInsufficientPermissions { courseController.listStaffOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentListStaffOfCourse() {
        assertInsufficientPermissions { courseController.listStaffOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAListStaffOfCourse() {
        assertSufficientPermissions { courseController.listStaffOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherListStaffOfCourse() {
        assertSufficientPermissions { courseController.listStaffOfCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAListSupplementaryRoleMappings() {
        assertInsufficientPermissions { courseController.listSupplementaryRoleMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentListSupplementaryRoleMappings() {
        assertInsufficientPermissions { courseController.listSupplementaryRoleMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAListSupplementaryRoleMappings() {
        assertSufficientPermissions { courseController.listSupplementaryRoleMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherListSupplementaryRoleMappings() {
        assertSufficientPermissions { courseController.listSupplementaryRoleMappings(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateParticipant() {
        val participantCreate = ParticipantCreateDto(NO_SS_PERSON_ID, 1L)
        assertInsufficientPermissions { courseController.createParticipant(SS_MOCK_COURSE_ID, participantCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateParticipant() {
        val participantCreate = ParticipantCreateDto(NO_SS_PERSON_ID, 1L)
        assertInsufficientPermissions { courseController.createParticipant(SS_MOCK_COURSE_ID, participantCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateParticipant() {
        val participantCreate = ParticipantCreateDto(NO_SS_PERSON_ID, 1L)
        assertInsufficientPermissions { courseController.createParticipant(SS_MOCK_COURSE_ID, participantCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateParticipant() {
        val participantCreate = ParticipantCreateDto(NO_SS_PERSON_ID, 1L)
        assertSufficientPermissions { courseController.createParticipant(SS_MOCK_COURSE_ID, participantCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetSingleParticipant() {
        assertInsufficientPermissions { courseController.getSingleParticipant(SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetSingleParticipant() {
        assertSufficientPermissions { courseController.getSingleParticipant(SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetSingleParticipant() {
        assertSufficientPermissions { courseController.getSingleParticipant(SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetSingleParticipant() {
        assertSufficientPermissions { courseController.getSingleParticipant(SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAUpdateParticipant() {
        val participantUpdate = ParticipantUpdateDto(1L, null, false)
        assertInsufficientPermissions { courseController.updateParticipant(
                SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1, participantUpdate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentUpdateParticipant() {
        val participantUpdate = ParticipantUpdateDto(1L, null, false)
        assertInsufficientPermissions { courseController.updateParticipant(
                SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1, participantUpdate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAUpdateParticipant() {
        val participantUpdate = ParticipantUpdateDto(1L, null, false)
        assertInsufficientPermissions { courseController.updateParticipant(
                SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1, participantUpdate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherUpdateParticipant() {
        val participantUpdate = ParticipantUpdateDto(1L, null, false)
        assertSufficientPermissions { courseController.updateParticipant(
                SS_MOCK_COURSE_ID, SS_STUDENT_PERSON_ID_1, participantUpdate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetFullCourse() {
        assertInsufficientPermissions { courseController.getFullCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetFullCourse() {
        assertSufficientPermissions { courseController.getFullCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetFullCourse() {
        assertSufficientPermissions { courseController.getFullCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetFullCourse() {
        assertSufficientPermissions { courseController.getFullCourse(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetCourseSheet() {
        assertInsufficientPermissions { courseController.getCourseSheet(SS_MOCK_COURSE_ID, httpServletResponse) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetCourseSheet() {
        assertInsufficientPermissions { courseController.getCourseSheet(SS_MOCK_COURSE_ID, httpServletResponse) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetCourseSheet() {
        assertSufficientPermissions { courseController.getCourseSheet(SS_MOCK_COURSE_ID, httpServletResponse) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetCourseSheet() {
        assertSufficientPermissions { courseController.getCourseSheet(SS_MOCK_COURSE_ID, httpServletResponse) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddLabel() {
        val labelCreate = LabelCreateUpdateDto("new-label", "FFFFFF")
        assertInsufficientPermissions { courseController.addLabel(SS_MOCK_COURSE_ID, labelCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddLabel() {
        val labelCreate = LabelCreateUpdateDto("new-label", "FFFFFF")
        assertInsufficientPermissions { courseController.addLabel(SS_MOCK_COURSE_ID, labelCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddLabel() {
        val labelCreate = LabelCreateUpdateDto("new-label", "FFFFFF")
        assertInsufficientPermissions { courseController.addLabel(SS_MOCK_COURSE_ID, labelCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddLabel() {
        val labelCreate = LabelCreateUpdateDto("new-label", "FFFFFF")
        assertSufficientPermissions { courseController.addLabel(SS_MOCK_COURSE_ID, labelCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAUpdateLabel() {
        val labelUpdate = LabelCreateUpdateDto("updated-label", "000000")
        assertInsufficientPermissions { courseController.updateLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1, labelUpdate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentUpdateLabel() {
        val labelUpdate = LabelCreateUpdateDto("updated-label", "000000")
        assertInsufficientPermissions { courseController.updateLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1, labelUpdate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAUpdateLabel() {
        val labelUpdate = LabelCreateUpdateDto("updated-label", "000000")
        assertInsufficientPermissions { courseController.updateLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1, labelUpdate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherUpdateLabel() {
        val labelUpdate = LabelCreateUpdateDto("updated-label", "000000")
        assertSufficientPermissions { courseController.updateLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1, labelUpdate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADeleteLabel() {
        assertInsufficientPermissions { courseController.deleteLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDeleteLabel() {
        assertInsufficientPermissions { courseController.deleteLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADeleteLabel() {
        assertInsufficientPermissions { courseController.deleteLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDeleteLabel() {
        assertSufficientPermissions { courseController.deleteLabel(SS_MOCK_COURSE_ID, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetSupplementaryRoles() {
        assertInsufficientPermissions { courseController.getSupplementaryRoles(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetSupplementaryRoles() {
        assertInsufficientPermissions { courseController.getSupplementaryRoles(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetSupplementaryRoles() {
        assertSufficientPermissions { courseController.getSupplementaryRoles(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetSupplementaryRoles() {
        assertSufficientPermissions { courseController.getSupplementaryRoles(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateSupplementaryRole() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("NewRole", listOf())
        assertInsufficientPermissions { courseController.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateSupplementaryRole() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("NewRole", listOf())
        assertInsufficientPermissions { courseController.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateSupplementaryRole() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("NewRole", listOf())
        assertInsufficientPermissions { courseController.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateSupplementaryRole() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("NewRole", listOf())
        assertSufficientPermissions { courseController.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetSignOffGroupSearchResults() {
        assertInsufficientPermissions { courseController.getSignOffGroupSearchResults(SS_MOCK_COURSE_ID, "a") }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetSignOffGroupSearchResults() {
        assertInsufficientPermissions { courseController.getSignOffGroupSearchResults(SS_MOCK_COURSE_ID, "a") }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetSignOffGroupSearchResults() {
        assertSufficientPermissions { courseController.getSignOffGroupSearchResults(SS_MOCK_COURSE_ID, "a") }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetSignOffGroupSearchResults() {
        assertSufficientPermissions { courseController.getSignOffGroupSearchResults(SS_MOCK_COURSE_ID, "a") }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetSignOffResultsFiltered() {
        assertInsufficientPermissions { courseController.getSignOffResultsFiltered(
                SS_MOCK_COURSE_ID, null, SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetSignOffResultsFiltered() {
        assertInsufficientPermissions { courseController.getSignOffResultsFiltered(
                SS_MOCK_COURSE_ID, null, SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetSignOffResultsFiltered() {
        assertSufficientPermissions { courseController.getSignOffResultsFiltered(
                SS_MOCK_COURSE_ID, null, SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetSignOffResultsFiltered() {
        assertSufficientPermissions { courseController.getSignOffResultsFiltered(
                SS_MOCK_COURSE_ID, null, SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetStudentDashboard() {
        assertThrows(ParticipantNotFoundException::class) { courseController.getStudentDashboard(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetStudentDashboard() {
        assertSufficientPermissions { courseController.getStudentDashboard(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetStudentDashboard() {
        assertSufficientPermissions { courseController.getStudentDashboard(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetStudentDashboard() {
        assertSufficientPermissions { courseController.getStudentDashboard(SS_MOCK_COURSE_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetGroupsFiltered() {
        assertInsufficientPermissions { courseController.getGroupsFiltered(Pageable.unpaged(), SS_MOCK_COURSE_ID,
                null, null, null, null) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetGroupsFiltered() {
        assertInsufficientPermissions { courseController.getGroupsFiltered(Pageable.unpaged(), SS_MOCK_COURSE_ID,
                null, null, null, null) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetGroupsFiltered() {
        assertSufficientPermissions { courseController.getGroupsFiltered(Pageable.unpaged(), SS_MOCK_COURSE_ID,
                null, null, null, null) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetGroupsFiltered() {
        assertSufficientPermissions { courseController.getGroupsFiltered(Pageable.unpaged(), SS_MOCK_COURSE_ID,
                null, null, null, null) }
    }

}
