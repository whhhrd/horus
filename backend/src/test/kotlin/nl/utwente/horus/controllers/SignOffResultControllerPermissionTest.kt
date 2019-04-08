package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.signoff.SignOffResultController
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.exceptions.ParticipantNotFoundException
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.signoff.SignOffResultPatchDto
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class SignOffResultControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var signOffResultController: SignOffResultController

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNACreateCommentThread() {
        val signOffResultPatch = SignOffResultPatchDto(listOf(), listOf())
        assertInsufficientPermissions { signOffResultController.createSignOff(
                SS_ASSIGNMENT_SET_ID, signOffResultPatch) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentCreateCommentThread() {
        val signOffResultPatch = SignOffResultPatchDto(listOf(), listOf())
        assertInsufficientPermissions { signOffResultController.createSignOff(
                SS_ASSIGNMENT_SET_ID, signOffResultPatch) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTACreateCommentThread() {
        val signOffResultPatch = SignOffResultPatchDto(listOf(), listOf())
        assertSufficientPermissions { signOffResultController.createSignOff(
                SS_ASSIGNMENT_SET_ID, signOffResultPatch) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherCreateCommentThread() {
        val signOffResultPatch = SignOffResultPatchDto(listOf(), listOf())
        assertSufficientPermissions { signOffResultController.createSignOff(
                SS_ASSIGNMENT_SET_ID, signOffResultPatch) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetCommentThread() {
        assertInsufficientPermissions { signOffResultController.getCommentThread(SS_SIGN_OFF_RESULT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetCommentThread() {
        assertInsufficientPermissions { signOffResultController.getCommentThread(SS_SIGN_OFF_RESULT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetCommentThread() {
        assertSufficientPermissions { signOffResultController.getCommentThread(SS_SIGN_OFF_RESULT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetCommentThread() {
        assertSufficientPermissions { signOffResultController.getCommentThread(SS_SIGN_OFF_RESULT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertThrows(ParticipantNotFoundException::class) { signOffResultController.addCommentThread(
                SS_SIGN_OFF_RESULT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertInsufficientPermissions { signOffResultController.addCommentThread(
                SS_SIGN_OFF_RESULT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { signOffResultController.addCommentThread(
                SS_SIGN_OFF_RESULT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { signOffResultController.addCommentThread(
                SS_SIGN_OFF_RESULT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetSignOffHistory() {
        assertInsufficientPermissions { signOffResultController.getSignOffHistory(
                SS_PARTICIPANT_IDS.first, SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetSignOffHistory() {
        assertInsufficientPermissions { signOffResultController.getSignOffHistory(
                SS_PARTICIPANT_IDS.first, SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetSignOffHistory() {
        assertSufficientPermissions { signOffResultController.getSignOffHistory(
                SS_PARTICIPANT_IDS.first, SS_ASSIGNMENT_SET_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetSignOffHistory() {
        assertSufficientPermissions { signOffResultController.getSignOffHistory(
                SS_PARTICIPANT_IDS.first, SS_ASSIGNMENT_SET_ID) }
    }

}
