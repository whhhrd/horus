package nl.utwente.horus.services.comment

import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.comment.CommentRepository
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.comment.CommentThreadRepository
import nl.utwente.horus.exceptions.CommentNotFoundException
import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

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

    fun getCommentById(id: Long): Comment {
        // TODO: Check if user is allowed to view this comment (regarding feedback or not for students)
        return commentRepository.findByIdOrNull(id) ?: throw CommentNotFoundException()
    }

    fun getCommentsOfThread(id: Long) : List<Comment> {
        return getThreadById(id).comments.toList()
    }

}