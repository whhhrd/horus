package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.comment.CommentController
import nl.utwente.horus.representations.comment.CommentCreateDto
import nl.utwente.horus.representations.comment.CommentUpdateDto
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class CommentControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var commentController: CommentController

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateComment() {
        val commentCreate = CommentCreateDto(SS_COMMENT_THREAD_ID, "NewComment")
        assertInsufficientPermissions { commentController.createComment(commentCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateComment() {
        val commentCreate = CommentCreateDto(SS_COMMENT_THREAD_ID, "NewComment")
        assertInsufficientPermissions { commentController.createComment(commentCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateComment() {
        val commentCreate = CommentCreateDto(SS_COMMENT_THREAD_ID, "NewComment")
        assertSufficientPermissions { commentController.createComment(commentCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateComment() {
        val commentCreate = CommentCreateDto(SS_COMMENT_THREAD_ID, "NewComment")
        assertSufficientPermissions { commentController.createComment(commentCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAUpdateComment() {
        val commentUpdate = CommentUpdateDto("UpdatedComment")
        assertInsufficientPermissions { commentController.updateComment(SS_COMMENT_ID, commentUpdate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentUpdateComment() {
        val commentUpdate = CommentUpdateDto("UpdatedComment")
        assertInsufficientPermissions { commentController.updateComment(SS_COMMENT_ID, commentUpdate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAUpdateComment() {
        val commentUpdate = CommentUpdateDto("UpdatedComment")
        assertSufficientPermissions { commentController.updateComment(SS_COMMENT_ID, commentUpdate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherUpdateComment() {
        val commentUpdate = CommentUpdateDto("UpdatedComment")
        assertSufficientPermissions { commentController.updateComment(SS_COMMENT_ID, commentUpdate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADeleteComment() {
        assertInsufficientPermissions { commentController.deleteComment(SS_COMMENT_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDeleteComment() {
        assertInsufficientPermissions { commentController.deleteComment(SS_COMMENT_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADeleteComment() {
        assertSufficientPermissions { commentController.deleteComment(SS_COMMENT_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDeleteComment() {
        assertSufficientPermissions { commentController.deleteComment(SS_COMMENT_ID) }
    }

}
