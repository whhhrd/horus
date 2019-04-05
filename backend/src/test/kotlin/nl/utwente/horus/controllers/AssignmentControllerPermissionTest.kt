package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.assignment.AssignmentController
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.person.PersonService
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class AssignmentControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var assignmentController: AssignmentController

    @Autowired
    lateinit var personService: PersonService

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var commentService: CommentService

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACanDeleteAssignments() {
        assertInsufficientPermissions { assignmentController.canDeleteAssignments(
                listOf(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCanDeleteAssignments() {
        // TODO: perhaps students should not be to see which assignments have any sign-offs
        assertSufficientPermissions { assignmentController.canDeleteAssignments(
                listOf(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACanDeleteAssignments() {
        assertSufficientPermissions { assignmentController.canDeleteAssignments(
                listOf(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCanDeleteAssignments() {
        assertSufficientPermissions { assignmentController.canDeleteAssignments(
                listOf(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetCommentThread() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val assignment = assignmentService.getAssignmentById(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        assignmentService.addThreadToAssignment(assignment, commentThread)
        assertInsufficientPermissions { assignmentController.getCommentThread(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetCommentThread() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val assignment = assignmentService.getAssignmentById(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        assignmentService.addThreadToAssignment(assignment, commentThread)
        assertInsufficientPermissions { assignmentController.getCommentThread(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetCommentThread() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val assignment = assignmentService.getAssignmentById(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        assignmentService.addThreadToAssignment(assignment, commentThread)
        assertSufficientPermissions { assignmentController.getCommentThread(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetCommentThread() {
        val person = personService.getPersonByLoginId(SS_TEACHER_LOGIN)!!
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        val assignment = assignmentService.getAssignmentById(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD)
        val commentThread = commentService.createThread(commentThreadCreate, person)
        assignmentService.addThreadToAssignment(assignment, commentThread)
        assertSufficientPermissions { assignmentController.getCommentThread(SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertInsufficientPermissions { assignmentController.addCommentThread(
                SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertInsufficientPermissions { assignmentController.addCommentThread(
                SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { assignmentController.addCommentThread(
                SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { assignmentController.addCommentThread(
                SS_ASSIGNMENT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

}
