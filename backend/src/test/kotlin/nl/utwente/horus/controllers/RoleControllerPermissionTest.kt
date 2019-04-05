package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.participant.RoleController
import nl.utwente.horus.representations.auth.SupplementaryRoleCreateUpdateDto
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.participant.SupplementaryRoleService
import nl.utwente.horus.services.person.PersonService
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class RoleControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var roleController: RoleController

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var supplementaryRoleService: SupplementaryRoleService

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNARemoveRoleMapping() {
        val assignerPerson = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val assignerParticipant = participantService.getParticipationInCourse(assignerPerson, SS_MOCK_COURSE_ID)
        val targetParticipant = participantService.getParticipantById(SS_PARTICIPANT_IDS.first)
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)
        supplementaryRoleService.assignSupplementaryRole(
                supplementaryRole, targetParticipant, assignerParticipant)

        assertInsufficientPermissions { roleController.removeRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentRemoveRoleMapping() {
        val assignerPerson = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val assignerParticipant = participantService.getParticipationInCourse(assignerPerson, SS_MOCK_COURSE_ID)
        val targetParticipant = participantService.getParticipantById(SS_PARTICIPANT_IDS.first)
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)
        supplementaryRoleService.assignSupplementaryRole(
                supplementaryRole, targetParticipant, assignerParticipant)

        assertInsufficientPermissions { roleController.removeRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTARemoveRoleMapping() {
        val assignerPerson = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val assignerParticipant = participantService.getParticipationInCourse(assignerPerson, SS_MOCK_COURSE_ID)
        val targetParticipant = participantService.getParticipantById(SS_PARTICIPANT_IDS.first)
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)
        supplementaryRoleService.assignSupplementaryRole(
                supplementaryRole, targetParticipant, assignerParticipant)

        assertInsufficientPermissions { roleController.removeRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherRemoveRoleMapping() {
        val assignerPerson = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val assignerParticipant = participantService.getParticipationInCourse(assignerPerson, SS_MOCK_COURSE_ID)
        val targetParticipant = participantService.getParticipantById(SS_PARTICIPANT_IDS.first)
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)
        supplementaryRoleService.assignSupplementaryRole(
                supplementaryRole, targetParticipant, assignerParticipant)

        assertSufficientPermissions { roleController.removeRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddRoleMapping() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)

        assertInsufficientPermissions { roleController.addRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddRoleMapping() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)

        assertInsufficientPermissions { roleController.addRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddRoleMapping() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)

        assertInsufficientPermissions { roleController.addRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddRoleMapping() {
        val supplementaryRoleCreate = SupplementaryRoleCreateUpdateDto("SupplementaryRole", listOf())
        val supplementaryRole = supplementaryRoleService.createSupplementaryRole(
                SS_MOCK_COURSE_ID, supplementaryRoleCreate)

        assertSufficientPermissions { roleController.addRoleMapping(
                SS_PARTICIPANT_IDS.first, supplementaryRole.id) }
    }

}
