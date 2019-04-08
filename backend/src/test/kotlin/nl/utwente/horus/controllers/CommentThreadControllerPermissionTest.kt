package nl.utwente.horus.controllers

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.controllers.comment.CommentThreadController
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class CommentThreadControllerPermissionTest: HorusAbstractTest() {

    @Autowired
    lateinit var commentThreadController: CommentThreadController

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNAGetThreads() {
        assertInsufficientPermissions { commentThreadController.getThreads(listOf(SS_COMMENT_THREAD_ID)) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentGetThreads() {
        assertInsufficientPermissions { commentThreadController.getThreads(listOf(SS_COMMENT_THREAD_ID)) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTAGetThreads() {
        assertSufficientPermissions { commentThreadController.getThreads(listOf(SS_COMMENT_THREAD_ID)) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherGetThreads() {
        assertSufficientPermissions { commentThreadController.getThreads(listOf(SS_COMMENT_THREAD_ID)) }
    }

    @Test
    @WithLoginId(SS_NA_LOGIN)
    fun testNADeleteThread() {
        assertInsufficientPermissions { commentThreadController.deleteThread(SS_COMMENT_THREAD_ID) }
    }

    @Test
    @WithLoginId(SS_STUDENT_LOGIN)
    fun testStudentDeleteThread() {
        assertInsufficientPermissions { commentThreadController.deleteThread(SS_COMMENT_THREAD_ID) }
    }

    @Test
    @WithLoginId(SS_TA_LOGIN)
    fun testTADeleteThread() {
        assertSufficientPermissions { commentThreadController.deleteThread(SS_COMMENT_THREAD_ID) }
    }

    @Test
    @WithLoginId(SS_TEACHER_LOGIN)
    fun testTeacherDeleteThread() {
        assertSufficientPermissions { commentThreadController.deleteThread(SS_COMMENT_THREAD_ID) }
    }

}
