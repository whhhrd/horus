package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.group.GroupSetsController
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class GroupSetControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var groupSetController: GroupSetsController

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetGroupSet() {
        assertInsufficientPermissions { groupSetController.getGroupSet(SS_GROUP_SET_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetGroupSet() {
        assertInsufficientPermissions { groupSetController.getGroupSet(SS_GROUP_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetGroupSet() {
        assertSufficientPermissions { groupSetController.getGroupSet(SS_GROUP_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetGroupSet() {
        assertSufficientPermissions { groupSetController.getGroupSet(SS_GROUP_SET_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetGroupSetGroups() {
        assertInsufficientPermissions { groupSetController.getGroupSetGroups(SS_GROUP_SET_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetGroupSetGroups() {
        assertInsufficientPermissions { groupSetController.getGroupSetGroups(SS_GROUP_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetGroupSetGroups() {
        assertSufficientPermissions { groupSetController.getGroupSetGroups(SS_GROUP_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetGroupSetGroups() {
        assertSufficientPermissions { groupSetController.getGroupSetGroups(SS_GROUP_SET_ID) }
    }

}
