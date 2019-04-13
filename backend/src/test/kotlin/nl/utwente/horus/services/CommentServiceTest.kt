package nl.utwente.horus.services

import nl.utwente.horus.HorusAbstractTest
import nl.utwente.horus.WithLoginId
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.comment.CommentType
import nl.utwente.horus.entities.person.Person
import nl.utwente.horus.exceptions.CommentNotFoundException
import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.representations.comment.CommentCreateDto
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentUpdateDto
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.participant.ParticipantService
import org.junit.Assert.*
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired

class CommentServiceTest : HorusAbstractTest() {

    @Autowired
    private lateinit var commentService: CommentService

    @Autowired
    private lateinit var participantService: ParticipantService

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetThreadById() {
        val expectedThread = createSampleCommentThread(getCurrentPerson())
        val actualThread = commentService.getThreadById(expectedThread.id)
        assertEquals(expectedThread, actualThread)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateThread() {
        val creator = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val threadCreate = CommentThreadCreateDto(CommentType.STAFF_ONLY, "Message")
        val thread = commentService.createThread(threadCreate, creator)
        assertEquals(creator, thread.author)
        assertEquals(threadCreate.type, thread.type)
        assertEquals(1, thread.comments.size)
        assertEquals(creator, thread.comments.first().author)
        assertEquals(threadCreate.content, thread.comments.first().content)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateThreadAlternative() {
        val creator = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        val visibilityType = CommentType.STAFF_ONLY
        val content = "Message"
        val thread = commentService.createThread(visibilityType, content, creator)
        assertEquals(creator, thread.author)
        assertEquals(visibilityType, thread.type)
        assertEquals(1, thread.comments.size)
        assertEquals(creator, thread.comments.first().author)
        assertEquals(content, thread.comments.first().content)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetCommentById() {
        val expectedComment = createSampleCommentThread(getCurrentPerson()).comments.first()
        val actualComment = commentService.getCommentById(expectedComment.id)
        assertEquals(expectedComment, actualComment)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateComment() {
        val thread = createSampleCommentThread(getCurrentPerson())
        val expectedComments = thread.comments.toMutableSet() // One way to make a copy of the set ;)
        val creator = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        expectedComments.add(commentService.createComment(CommentCreateDto(thread.id, "Message3"), creator))
        val actualComments = commentService.getThreadById(thread.id).comments
        assertEquals(expectedComments, actualComments)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testCreateCommentAlternative() {
        val thread = createSampleCommentThread(getCurrentPerson())
        val expectedComments = thread.comments.toMutableSet() // One way to make a copy of the set ;)
        val creator = participantService.getCurrentParticipationInCourse(PP_MOCK_COURSE_ID)
        expectedComments.add(commentService.createComment(thread.id, "Message3", creator))
        val actualComments = commentService.getThreadById(thread.id).comments
        assertEquals(expectedComments, actualComments)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testUpdateComment() {
        val oldComment = createSampleCommentThread(getCurrentPerson()).comments.first()
        val oldCommentId = oldComment.id
        val newContent = "Message3"
        val updatedComment = commentService.updateComment(oldCommentId, CommentUpdateDto(newContent))
        assertEquals(oldCommentId, updatedComment.id)
        assertEquals(newContent, updatedComment.content)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testUpdateCommentAlternative() {
        val oldComment = createSampleCommentThread(getCurrentPerson()).comments.first()
        val oldCommentId = oldComment.id
        val newContent = "Message3"
        val updatedComment = commentService.updateComment(oldCommentId, newContent)
        assertEquals(oldCommentId, updatedComment.id)
        assertEquals(newContent, updatedComment.content)
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testGetCommentsOfThread() {
        val thread = createSampleCommentThread(getCurrentPerson())
        val comments = commentService.getCommentsOfThread(thread.id)
        assertEquals(thread.comments.toSet(), comments.toSet())
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteCommentThread() {
        val thread = createSampleCommentThread(getCurrentPerson())
        val threadId = thread.id
        commentService.deleteCommentsThread(thread)
        assertThrows(CommentThreadNotFoundException::class) {
            commentService.getThreadById(threadId)
        }
    }

    @Test
    @WithLoginId(PP_TEACHER_LOGIN)
    fun testDeleteComments() {
        val thread = createSampleCommentThread(getCurrentPerson())
        val comments = thread.comments.toList()
        val keptComment = comments[0]
        val deletedComment = comments[1]
        val deletedCommentId = deletedComment.id

        commentService.deleteComment(deletedComment)
        assertThrows(CommentNotFoundException::class) {
            commentService.getCommentById(deletedCommentId)
        }

        val newThread = commentService.getThreadById(thread.id)
        assertEquals(1, newThread.comments.size)
        assertEquals(keptComment, thread.comments.first())
    }


    private fun createSampleCommentThread(creatorPerson: Person): CommentThread {
        val creator = participantService.getParticipationInCourse(creatorPerson, PP_MOCK_COURSE_ID)
        val commentThread = commentService.createThread(CommentType.STAFF_ONLY, "Message", creator)
        commentService.createComment(commentThread.id, "Message2", creator)
        return commentThread
    }

}
