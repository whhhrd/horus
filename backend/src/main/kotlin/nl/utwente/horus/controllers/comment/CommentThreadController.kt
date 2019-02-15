package nl.utwente.horus.controllers.comment

import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.services.comment.CommentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path=["/api/threads"])
@Transactional
class CommentThreadController {

    @Autowired
    lateinit var commentService: CommentService

    @GetMapping(path = ["/{threadId}"])
    fun getThread(@PathVariable threadId: Long): CommentThreadDtoFull {
        return CommentThreadDtoFull(commentService.getThreadById(threadId))
    }

}