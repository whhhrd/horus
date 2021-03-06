package nl.utwente.horus.services.comment

import nl.utwente.horus.entities.comment.*
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.CommentNotFoundException
import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.representations.comment.CommentCreateDto
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentUpdateDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Component
@Transactional
class CommentService {

    @Autowired
    lateinit var commentRepository: CommentRepository

    @Autowired
    lateinit var commentThreadRepository: CommentThreadRepository

    fun getThreadById(id: Long) : CommentThread {
        // TODO: Check if user is allowed to view this thread (regarding feedback or not for students)
        return commentThreadRepository.findByIdOrNull(id) ?: throw CommentThreadNotFoundException()
    }

    fun createThread(dto: CommentThreadCreateDto, author: Participant): CommentThread {
        return createThread(dto.type, dto.content, author)
    }

    fun createThread(type: CommentType, initialMessage: String, author: Participant): CommentThread {
        val thread = CommentThread(author, type)
        val comment = Comment(author, thread, initialMessage)
        thread.comments.add(comment)
        return commentThreadRepository.save(thread)
    }

    fun getCommentById(id: Long): Comment {
        // TODO: Check if user is allowed to view this comment (regarding feedback or not for students)
        return commentRepository.findByIdOrNull(id) ?: throw CommentNotFoundException()
    }

    fun createComment(dto: CommentCreateDto, author: Participant): Comment {
        return createComment(dto.threadId, dto.content, author)
    }

    fun createComment(threadId: Long, content: String, author: Participant): Comment {
        val thread = getThreadById(threadId)
        val comment = commentRepository.save(Comment(author, thread, content))
        thread.comments.add(comment)
        return comment
    }

    fun updateComment(id: Long, dto: CommentUpdateDto): Comment {
        return updateComment(id, dto.content)
    }

    fun updateComment(id: Long, content: String): Comment {
        val comment = getCommentById(id)
        if (comment.content != content) {
            comment.content = content
            comment.lastEditedAt = ZonedDateTime.now()
        }
        return comment
    }

    fun getCommentsOfThread(id: Long) : List<Comment> {
        return getThreadById(id).comments.toList()
    }

    fun deleteCommentsThread(thread: CommentThread) {
        commentThreadRepository.delete(thread)
    }

    fun deleteComment(comment: Comment): CommentThread? {
        if (comment.thread.comments.size <= 1) {
            deleteCommentsThread(comment.thread)
            return null
        } else {
            comment.thread.comments.remove(comment)
            commentRepository.delete(comment)
            return comment.thread
        }

    }



}
