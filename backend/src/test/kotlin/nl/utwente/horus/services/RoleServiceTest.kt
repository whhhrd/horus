package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.auth.permissions.HorusPermission
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.entities.auth.SupplementaryRole
import nl.utwente.horus.services.participant.SupplementaryRoleService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class RoleServiceTest : HorusAbstractTest() {

    @Autowired
    lateinit var supplementaryRoleService: SupplementaryRoleService

    companion object {
        val ADDED_PERMISSIONS = listOf(
                HorusPermission.anyEdit(HorusResource.COURSE_ASSIGNMENTSET),
                HorusPermission.anyDelete(HorusResource.COURSE_PARTICIPANT_LABEL_MAPPING))
    }
    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testCreateRole() {
        val role = createFreshSupplementaryRole()
        assertEquals(PP_MOCK_COURSE_ID, role.course.id)

        val byId = supplementaryRoleService.getSupplementaryRoleById(role.id)
        assertEquals(role.name, byId.name)
        assertEquals(ADDED_PERMISSIONS.size, byId.permissions.size)
    }

    private fun createFreshSupplementaryRole(): SupplementaryRole {
        return supplementaryRoleService.createSupplementaryRole(getPPCourse(), "admins", ADDED_PERMISSIONS)
    }

    @Test
    @WithLoginId(TEACHER_LOGIN)
    fun testAssignUnassignRole() {
        // Check that previously permissions weren't added
        val role = createFreshSupplementaryRole()
        val receiver = getStudentParticipant()
        val oldAuthorities = receiver.person.getAuthorities().filter { PP_MOCK_COURSE_ID in it.courseIds }
        ADDED_PERMISSIONS.forEach { permission -> assertFalse(permission in oldAuthorities.map { it.permission }) }
        assertFalse(supplementaryRoleService.isSupplementaryRoleAssigned(receiver, role))

        // Now assign supplementary role
        val assigner = getTeacherParticipant()
        supplementaryRoleService.assignSupplementaryRole(role, receiver, assigner)

        // Check that new permissions are now available
        assertTrue(supplementaryRoleService.isSupplementaryRoleAssigned(receiver, role))
        val newAuthorities = receiver.person.getAuthorities()
                .filter { PP_MOCK_COURSE_ID in it.courseIds && it.permission in ADDED_PERMISSIONS }
        assertEquals(ADDED_PERMISSIONS.size, newAuthorities.size)
        assertEquals(ADDED_PERMISSIONS.toSet(), newAuthorities.map { it.permission }.toSet())

        // Remove supplementary role and check that they are unavailable again
        supplementaryRoleService.deAssignSupplementaryRole(role, receiver)
        val restoredAuthorities = receiver.person.getAuthorities().filter { PP_MOCK_COURSE_ID in it.courseIds }
        ADDED_PERMISSIONS.forEach { permission -> assertFalse(permission in restoredAuthorities.map { it.permission }) }
        assertFalse(supplementaryRoleService.isSupplementaryRoleAssigned(receiver, role))
    }
}