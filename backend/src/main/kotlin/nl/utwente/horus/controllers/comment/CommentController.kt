package nl.utwente.horus.controllers.comment

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.comment.Comment
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.representations.comment.CommentCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.representations.comment.CommentUpdateDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/comments"])
@Transactional
class CommentController: BaseController() {
    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailsService: HorusUserDetailService

    @PostMapping(path = ["", "/"])
    fun createComment(@RequestBody dto: CommentCreateDto) : CommentThreadDtoFull {
        val author = userDetailsService.getCurrentPerson()
        val comment = commentService.createComment(dto, author)

        verifyCoursePermission(CommentThread::class, dto.threadId, HorusPermissionType.CREATE,
                toHorusResource(comment.thread))

        return CommentThreadDtoFull(comment.thread)
    }

    @PutMapping(path = ["/{commentId}"])
    fun updateComment(@PathVariable commentId: Long, @RequestBody dto: CommentUpdateDto): CommentThreadDtoFull {
        val comment = commentService.updateComment(commentId, dto)

        verifyCoursePermission(Comment::class, comment.id, HorusPermissionType.EDIT,
                toHorusResource(comment.thread))

        return CommentThreadDtoFull(comment.thread)
    }

    /**
     * Deletes comment and possibly the whole thread, if this comment was the last one of the thread.
     * In the last case, the return value is null.
     */
    @DeleteMapping(path = ["/{commentId}"])
    fun deleteComment(@PathVariable commentId: Long): CommentThreadDtoFull? {
        val existing = commentService.getCommentById(commentId)
        verifyCoursePermission(Comment::class, commentId, HorusPermissionType.DELETE, toHorusResource(existing.thread))

        val thread = commentService.deleteComment(existing)
        return thread?.let { CommentThreadDtoFull(it) }
    }
}
