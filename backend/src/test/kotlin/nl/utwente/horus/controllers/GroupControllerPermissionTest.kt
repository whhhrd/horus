package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.group.GroupController
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.group.GroupService
import nl.utwente.horus.services.person.PersonService
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class GroupControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var groupController: GroupController

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var commentService: CommentService

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetGroup() {
        assertInsufficientPermissions { groupController.getGroup(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetGroup() {
        assertInsufficientPermissions { groupController.getGroup(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetGroup() {
        assertSufficientPermissions { groupController.getGroup(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetGroup() {
        assertSufficientPermissions { groupController.getGroup(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetGroupComments() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val group = groupService.getGroupById(SS_GROUP_ID)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        groupService.addThread(group, commentThread)
        assertInsufficientPermissions { groupController.getGroupComments(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetGroupComments() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val group = groupService.getGroupById(SS_GROUP_ID)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        groupService.addThread(group, commentThread)
        assertInsufficientPermissions { groupController.getGroupComments(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetGroupComments() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val group = groupService.getGroupById(SS_GROUP_ID)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        groupService.addThread(group, commentThread)
        assertSufficientPermissions { groupController.getGroupComments(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetGroupComments() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val group = groupService.getGroupById(SS_GROUP_ID)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        groupService.addThread(group, commentThread)
        assertSufficientPermissions { groupController.getGroupComments(SS_GROUP_ID) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddGroupComments() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertInsufficientPermissions { groupController.addGroupComments(SS_GROUP_ID, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddGroupComments() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertInsufficientPermissions { groupController.addGroupComments(SS_GROUP_ID, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddGroupComments() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { groupController.addGroupComments(SS_GROUP_ID, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddGroupComments() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { groupController.addGroupComments(SS_GROUP_ID, commentThreadCreate) }
    }

}
