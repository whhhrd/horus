package nl.utwente.horus.controllers.comment

import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/threads"])
@Transactional
class CommentThreadController {

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping(path = ["/{threadId}"])
    fun getThread(@PathVariable threadId: Long): CommentThreadDtoFull {
        return CommentThreadDtoFull(commentService.getThreadById(threadId))
    }

    @PostMapping(path = ["", "/"])
    fun createThread(@RequestBody dto: CommentThreadCreateDto): CommentThreadDtoFull {
        val author = userDetailService.getCurrentPerson()
        return CommentThreadDtoFull(commentService.createThread(dto, author))
    }

}