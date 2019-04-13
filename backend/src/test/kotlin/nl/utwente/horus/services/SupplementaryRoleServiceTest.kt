package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.auth.permissions.HorusResourceScope
import nl.utwente.horus.exceptions.SupplementaryRoleNotFoundException
import nl.utwente.horus.representations.auth.SupplementaryRoleCreateUpdateDto
import nl.utwente.horus.services.participant.ParticipantService
import nl.utwente.horus.services.participant.SupplementaryRoleService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class SupplementaryRoleServiceTest : HorusAbstractTest() {

    @Autowired
    private lateinit var supplementaryRoleService: SupplementaryRoleService

    @Autowired
    private lateinit var participantService: ParticipantService

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetSupplementaryRoleById() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val expectedRole = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val actualRole = supplementaryRoleService.getSupplementaryRoleById(expectedRole.id)
        assertEquals(expectedRole, actualRole)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetRolesByCourseEmpty() {
        val roles = supplementaryRoleService.getRolesByCourse(getPPCourse())
        assertEquals(0, roles.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetRolesByCourse() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val expectedRole = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val roles = supplementaryRoleService.getRolesByCourse(getPPCourse())
        assertEquals(1, roles.size)
        assertEquals(expectedRole, roles[0])
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetMappingsByCourseEmpty() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val mappings = supplementaryRoleService.getMappingsByCourse(getPPCourse())
        assertEquals(0, mappings.size)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetMappingsByCourse() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val role = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        supplementaryRoleService.assignSupplementaryRole(role, participant, participant)
        val mappings = supplementaryRoleService.getMappingsByCourse(getPPCourse())
        assertEquals(1, mappings.size)
        assertEquals(role, mappings[0].supplementaryRole)
        assertEquals(participant, mappings[0].participant)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testIsSupplementaryRoleAssignedFalse() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val role = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val isAssigned = supplementaryRoleService.isSupplementaryRoleAssigned(participant, role)
        assertFalse(isAssigned)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testIsSupplementaryRoleAssignedTrue() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val role = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        supplementaryRoleService.assignSupplementaryRole(role, participant, participant)
        val isAssigned = supplementaryRoleService.isSupplementaryRoleAssigned(participant, role)
        assertTrue(isAssigned)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAssignSupplementaryRole() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val role = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        supplementaryRoleService.assignSupplementaryRole(role, participant, participant)
        val isAssigned = supplementaryRoleService.isSupplementaryRoleAssigned(participant, role)
        assertTrue(isAssigned)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateSupplementaryRole() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val expectedRole = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val actualRole = supplementaryRoleService.getSupplementaryRoleById(expectedRole.id)
        assertEquals(roleCreate.name, expectedRole.name)
        assertEquals(expectedRole, actualRole)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteSupplementaryRole() {
        val roleCreate = SupplementaryRoleCreateUpdateDto("SupRole", listOf())
        val role = supplementaryRoleService.createSupplementaryRole(PP_MOCK_COURSE_ID, roleCreate)
        val roleId = role.id
        supplementaryRoleService.deleteSupplementaryRole(role)
        assertThrows(SupplementaryRoleNotFoundException::class) {
            supplementaryRoleService.getSupplementaryRoleById(roleId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateSupplementaryRoleAlternative() {
        val roleName = "SupRole"
        val expectedRole = supplementaryRoleService.createSupplementaryRole(getPPCourse(), roleName, listOf())
        val actualRole = supplementaryRoleService.getSupplementaryRoleById(expectedRole.id)
        assertEquals(roleName, expectedRole.name)
        assertEquals(expectedRole, actualRole)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testAddPermissionToRole() {
        val role = supplementaryRoleService.createSupplementaryRole(getPPCourse(), "SupRole", listOf())
        val permission = HorusPermission.anyList(HorusResource.COURSE_ASSIGNMENTSET)
        supplementaryRoleService.addPermissionToRole(role, permission)
        val updatedRole = supplementaryRoleService.getSupplementaryRoleById(role.id)
        assertEquals(role.name, updatedRole.name)
        assertEquals(1, updatedRole.permissions.size)
        assertEquals(permission.toString(), updatedRole.permissions[0].name)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeAssignSupplementaryRole() {
        val role = supplementaryRoleService.createSupplementaryRole(getPPCourse(), "SupRole", listOf())
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        supplementaryRoleService.assignSupplementaryRole(role, participant, participant)
        supplementaryRoleService.deAssignSupplementaryRole(role, participant)
        val isAssigned = supplementaryRoleService.isSupplementaryRoleAssigned(participant, role)
        assertFalse(isAssigned)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeAssignSupplementaryRoleAlternative() {
        val role = supplementaryRoleService.createSupplementaryRole(getPPCourse(), "SupRole", listOf())
        val participant = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        supplementaryRoleService.assignSupplementaryRole(role, participant, participant)
        val updatedRole = supplementaryRoleService.getSupplementaryRoleById(role.id)
        supplementaryRoleService.deAssignSupplementaryRole(updatedRole.participantMappings.toList()[0])
        val isAssigned = supplementaryRoleService.isSupplementaryRoleAssigned(participant, role)
        assertFalse(isAssigned)
    }

}
