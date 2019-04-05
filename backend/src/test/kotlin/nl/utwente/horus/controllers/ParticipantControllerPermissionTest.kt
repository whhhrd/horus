package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.participant.ParticipantController
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class ParticipantControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var participantController: ParticipantController

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetParticipants() {
        assertInsufficientPermissions { participantController.getParticipants(listOf(SS_PARTICIPANT_IDS.first)) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetParticipants() {
        assertInsufficientPermissions { participantController.getParticipants(listOf(SS_PARTICIPANT_IDS.first)) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetParticipants() {
        assertSufficientPermissions { participantController.getParticipants(listOf(SS_PARTICIPANT_IDS.first)) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetParticipants() {
        assertSufficientPermissions { participantController.getParticipants(listOf(SS_PARTICIPANT_IDS.first)) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetCommentsOfParticipants() {
        assertInsufficientPermissions { participantController.getCommentsOfParticipant(
                SS_PARTICIPANT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetCommentsOfParticipants() {
        assertInsufficientPermissions { participantController.getCommentsOfParticipant(
                SS_PARTICIPANT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetCommentsOfParticipants() {
        assertSufficientPermissions { participantController.getCommentsOfParticipant(
                SS_PARTICIPANT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetCommentsOfParticipants() {
        assertSufficientPermissions { participantController.getCommentsOfParticipant(
                SS_PARTICIPANT_ID_WITH_COMMENT_THREAD) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertInsufficientPermissions { participantController.addCommentThread(
                SS_PARTICIPANT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertInsufficientPermissions { participantController.addCommentThread(
                SS_PARTICIPANT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { participantController.addCommentThread(
                SS_PARTICIPANT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddCommentThread() {
        val commentThreadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "NewComment")
        assertSufficientPermissions { participantController.addCommentThread(
                SS_PARTICIPANT_ID_WITHOUT_COMMENT_THREAD, commentThreadCreate) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAAddLabelMapping() {
        assertInsufficientPermissions { participantController.addLabelMapping(SS_PARTICIPANT_IDS.first, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentAddLabelMapping() {
        assertInsufficientPermissions { participantController.addLabelMapping(SS_PARTICIPANT_IDS.first, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAAddLabelMapping() {
        assertSufficientPermissions { participantController.addLabelMapping(SS_PARTICIPANT_IDS.first, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherAddLabelMapping() {
        assertSufficientPermissions { participantController.addLabelMapping(SS_PARTICIPANT_IDS.first, SS_LABEL_ID_1) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADeleteLabelMapping() {
        assertInsufficientPermissions { participantController.deleteLabelMapping(
                SS_PARTICIPANT_IDS.first, SS_LABEL_ID_2) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDeleteLabelMapping() {
        assertInsufficientPermissions { participantController.deleteLabelMapping(
                SS_PARTICIPANT_IDS.first, SS_LABEL_ID_2) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADeleteLabelMapping() {
        assertSufficientPermissions { participantController.deleteLabelMapping(
                SS_PARTICIPANT_IDS.first, SS_LABEL_ID_2) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDeleteLabelMapping() {
        assertSufficientPermissions { participantController.deleteLabelMapping(
                SS_PARTICIPANT_IDS.first, SS_LABEL_ID_2) }
    }

}
