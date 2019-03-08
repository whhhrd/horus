package nl.utwente.horus.controllers.assignment

import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.services.assignment.AssignmentService
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.signoff.SignOffService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/assignments"])
@Transactional
class AssignmentController {

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @GetMapping(path = ["/deletable"])
    fun canDeleteAssignments(@RequestParam assignmentIds: List<Long>): List<Boolean>  {
        val result = signOffService.getSignOffResultCounts(assignmentIds).mapKeys { it.key.id }
        return assignmentIds.map { result[it] == 0L }
    }

    @DeleteMapping(path = ["/{assignmentId}"])
    fun deleteAssignment(@PathVariable assignmentId: Long) {
        assignmentService.deleteAssignment(assignmentService.getAssignmentById(assignmentId))
    }

    @GetMapping(path = ["/{assignmentId}/comments"])
    fun getCommentThread(@PathVariable assignmentId: Long): CommentThreadDtoFull {
        val thread = assignmentService.getAssignmentById(assignmentId).commentThread
                ?: throw CommentThreadNotFoundException()
        return CommentThreadDtoFull(thread)
    }

    @PostMapping(path = ["/{assignmentId}/comments"])
    fun addCommentThread(@PathVariable assignmentId: Long, @RequestBody dto: CommentThreadCreateDto): CommentThreadDtoFull {
        val user = userDetailService.getCurrentPerson()
        val thread = commentService.createThread(dto, user)
        val assignment = assignmentService.getAssignmentById(assignmentId)
        assignmentService.addThreadToAssignment(assignment, thread)
        return CommentThreadDtoFull(thread)
    }

}