package nl.utwente.horus.controllers.comment

import nl.utwente.horus.representations.comment.CommentCreateDto
import nl.utwente.horus.representations.comment.CommentDto
import nl.utwente.horus.representations.comment.CommentUpdateDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/comments"])
@Transactional
class CommentController {
    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailsService: HorusUserDetailService

    @PostMapping(path = ["", "/"])
    fun createComment(@RequestBody dto: CommentCreateDto) : CommentDto {
        val author = userDetailsService.getCurrentPerson()
        return CommentDto(commentService.createComment(dto, author))
    }

    @PutMapping(path = ["/{commentId}"])
    fun updateComment(@PathVariable commentId: Long, @RequestBody dto: CommentUpdateDto): CommentDto {
        return CommentDto(commentService.updateComment(commentId, dto))
    }

    @DeleteMapping(path = ["/{commentId}"])
    fun deleteComment(@PathVariable commentId: Long) {
        commentService.deleteComment(commentService.getCommentById(commentId))
    }
}
