package nl.utwente.horus.controllers.participant

import nl.utwente.horus.auth.permissions.HorusPermissionType
import nl.utwente.horus.auth.permissions.HorusResource
import nl.utwente.horus.controllers.BaseController
import nl.utwente.horus.entities.comment.CommentThread
import nl.utwente.horus.entities.participant.Participant
import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.exceptions.CourseMismatchException
import nl.utwente.horus.exceptions.EmptyListException
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.representations.participant.ParticipantDtoFull
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.course.CourseService
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/participants"])
@Transactional
class ParticipantController: BaseController() {

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var labelService: LabelService

    @Autowired
    lateinit var courseService: CourseService

    @GetMapping(path = ["/", ""])
    fun getParticipants(@RequestParam participantIds: List<Long>): List<ParticipantDtoFull> {
        if (participantIds.isEmpty()) {
            throw EmptyListException()
        }
        val participants = participantService.getParticipantsById(participantIds)
        val initialId = participants.first().course.id
        if (participants.map { it.course.id }.any { it != initialId }) {
            // Participants come from different courses
            throw CourseMismatchException()
        }
        // Check ANY on first item, that will hold for whole list since they originate from same course
        requireAnyPermission(Participant::class, participants.first().id, HorusPermissionType.VIEW)
        return participants.map { ParticipantDtoFull(it) }
    }

    @GetMapping(path = ["/{pId}/comments"])
    fun getCommentsOfParticipant(@PathVariable pId: Long): CommentThreadDtoFull {
        val participant = participantService.getParticipantById(pId)
        if (participant.commentThread == null) {
            throw CommentThreadNotFoundException()
        }
        val thread = participant.commentThread!!
        verifyCoursePermission(CommentThread::class, thread.id, HorusPermissionType.VIEW, toHorusResource(thread))
        return CommentThreadDtoFull(thread)
    }

    @PostMapping(path = ["/{pId}/comments"])
    fun addCommentThread(@PathVariable pId: Long, @RequestBody dto: CommentThreadCreateDto): CommentThreadDtoFull {
        val p = participantService.getParticipantById(pId)
        val thread = commentService.createThread(dto, getCurrentParticipationInCourse(p.course))
        // Update participant, but using new comment thread
        participantService.addThread(p, thread)
        verifyCoursePermission(CommentThread::class, thread.id, HorusPermissionType.CREATE, toHorusResource(thread))
        return CommentThreadDtoFull(thread)
    }

    @PostMapping(path = ["/{pId}/labels/{labelId}"])
    fun addLabelMapping(@PathVariable pId: Long, @PathVariable labelId: Long): ParticipantDtoFull {
        verifyCoursePermission(Participant::class, pId, HorusPermissionType.CREATE,
                HorusResource.COURSE_PARTICIPANT_LABEL_MAPPING)

        val participant = participantService.getParticipantById(pId)
        val label = labelService.getLabelById(labelId)
        participantService.addLabel(participant, label)
        return ParticipantDtoFull(participant)
    }

    @DeleteMapping(path = ["/{pId}/labels/{labelId}"])
    fun deleteLabelMapping(@PathVariable pId: Long, @PathVariable labelId: Long): ParticipantDtoFull {
        verifyCoursePermission(Participant::class, pId, HorusPermissionType.DELETE,
                HorusResource.COURSE_PARTICIPANT_LABEL_MAPPING)

        val participant = participantService.getParticipantById(pId)
        val label = labelService.getLabelById(labelId)
        participantService.removeLabelMapping(participant, label)
        return ParticipantDtoFull(participant)
    }


}