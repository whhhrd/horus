package nl.utwente.horus.controllers.comment

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/threads"])
@Transactional
class CommentThreadController: BaseController() {

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping(path = ["", "/"])
    fun getThreads(@RequestParam threadIds: List<Long>): List<CommentThreadDtoFull> {
        val threads = threadIds.map { commentService.getThreadById(it) }
        threads.forEach {
            verifyCoursePermission(CommentThread::class, it.id, HorusPermissionType.VIEW, toHorusResource(it))
        }
        return threads.map { CommentThreadDtoFull(it) }
    }

    @DeleteMapping(path = ["/{threadId}"])
    fun deleteThread(@PathVariable threadId: Long) {
        val thread = commentService.getThreadById(threadId)
        verifyCoursePermission(CommentThread::class, threadId, HorusPermissionType.DELETE, toHorusResource(thread))
        commentService.deleteCommentsThread(thread)
    }

}