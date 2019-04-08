package nl.utwente.horus.controllers.signoff

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.CommentThreadNotFoundException
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
class SignOffResultController: BaseController() {

    @Autowired
    lateinit var signOffService: SignOffService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @PatchMapping(path = ["/{assignmentSetId}"])
    fun createSignOff(@PathVariable assignmentSetId: Long, @RequestBody dto: SignOffResultPatchDto): List<SignOffResultDtoSummary> {
        requireAnyPermission(AssignmentSet::class, assignmentSetId, HorusPermissionType.CREATE, HorusResource.COURSE_SIGNOFFRESULT)
        requireAnyPermission(AssignmentSet::class, assignmentSetId, HorusPermissionType.EDIT, HorusResource.COURSE_SIGNOFFRESULT)

        return signOffService.processSignOffs(dto, assignmentSetId).map { SignOffResultDtoSummary(it) }
    }

    @GetMapping(path = ["/{signOffId}/comments"])
    fun getCommentThread(@PathVariable signOffId: Long): CommentThreadDtoFull {

        val thread = signOffService.getSignOffResultById(signOffId).commentThread
                ?: throw CommentThreadNotFoundException()

        verifyCoursePermission(SignOffResult::class, signOffId, HorusPermissionType.VIEW, toHorusResource(thread))

        return CommentThreadDtoFull(thread)
    }

    @PostMapping(path = ["/{signOffId}/comments"])
    fun addCommentThread(@PathVariable signOffId: Long, @RequestBody dto: CommentThreadCreateDto): CommentThreadDtoFull {
        val result = signOffService.getSignOffResultById(signOffId)
        // Use participant from same course as the participant who created the assignment (shortest way to course)
        val author = getCurrentParticipationInCourse(result.participant.course)
        val thread = commentService.createThread(dto, author)
        signOffService.addThreadToSignOffResult(result, thread)

        verifyCoursePermission(SignOffResult::class, signOffId, HorusPermissionType.CREATE, toHorusResource(thread))

        return CommentThreadDtoFull(thread)
    }

    @GetMapping(path = ["/history"])
    fun getSignOffHistory(@RequestParam participantId: Long, @RequestParam assignmentId: Long): List<SignOffResultDtoSummary> {
        requireAnyPermission(Participant::class, participantId, HorusPermissionType.VIEW, HorusResource.COURSE_SIGNOFFRESULT)
        val results = signOffService.getSignOffHistory(participantId, assignmentId)

        if (results.isNotEmpty()) {
            // Check that
            // Check permission based on first result: will hold for rest as well (since they are for same participant)
            verifyCoursePermission(SignOffResult::class, results.first().id, HorusPermissionType.VIEW)
        }

        return results.sortedByDescending { it.signedAt }.map { SignOffResultDtoSummary(it) }
    }

}