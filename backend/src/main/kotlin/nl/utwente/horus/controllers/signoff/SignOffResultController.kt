package nl.utwente.horus.controllers.signoff

import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.representations.assignment.SignOffResultDtoCompact
import nl.utwente.horus.representations.assignment.SignOffResultDtoSummary
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.representations.signoff.SignOffResultPatchDto
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.signoff.SignOffService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@Transactional
@RequestMapping(path=["/api/signoff"])
class SignOffResultController {

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @PatchMapping(path = ["/{assignmentSetId}"])
    fun createSignOff(@PathVariable assignmentSetId: Long, @RequestBody dto: SignOffResultPatchDto): List<SignOffResultDtoSummary> {
        return signOffService.processSignOffs(dto, assignmentSetId).map { SignOffResultDtoSummary(it) }

    }

    @GetMapping(path = ["/{signOffId}/comments"])
    fun getCommentThread(@PathVariable signOffId: Long): CommentThreadDtoFull {
        val thread = signOffService.getSignOffResultById(signOffId).commentThread
                ?: throw CommentThreadNotFoundException()
        return CommentThreadDtoFull(thread)
    }

    @PostMapping(path = ["/{signOffId}/comments"])
    fun addCommentThread(@PathVariable signOffId: Long, @RequestBody dto: CommentThreadCreateDto): CommentThreadDtoFull {
        val user = userDetailService.getCurrentPerson()
        val thread = commentService.createThread(dto, user)
        val result = signOffService.getSignOffResultById(signOffId)
        signOffService.addThreadToSignOffResult(result, thread)
        return CommentThreadDtoFull(thread)
    }

    @GetMapping(path = ["/history"])
    fun getSignOffHistory(@RequestParam participantId: Long, @RequestParam assignmentId: Long): List<SignOffResultDtoSummary> {
        return signOffService.getSignOffHistory(participantId, assignmentId).sortedByDescending { it.signedAt }.map { SignOffResultDtoSummary(it) }
    }

}