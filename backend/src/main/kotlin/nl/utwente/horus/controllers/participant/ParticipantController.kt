package nl.utwente.horus.controllers.participant

import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.representations.participant.ParticipantDtoFull
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
import nl.utwente.horus.services.participant.LabelService
import nl.utwente.horus.services.participant.ParticipantService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path=["/api/participants"])
@Transactional
class ParticipantController {

    @Autowired
    lateinit var userDetailService: HorusUserDetailService

    @Autowired
    lateinit var commentService: CommentService

    @Autowired
    lateinit var participantService: ParticipantService

    @Autowired
    lateinit var labelService: LabelService

    @GetMapping(path = ["/{pId}/comments"])
    fun getCommentsOfParticipant(@PathVariable pId: Long): CommentThreadDtoFull {
        val participant = participantService.getParticipantById(pId)
        if (participant.commentThread == null) {
            throw CommentThreadNotFoundException()
        }
        return CommentThreadDtoFull(participant.commentThread!!)
    }

    @PostMapping(path = ["/{pId}/comments"])
    fun addCommentThread(@PathVariable pId: Long, @RequestBody dto: CommentThreadCreateDto): CommentThreadDtoFull {
        val thread = commentService.createThread(dto, userDetailService.getCurrentPerson())
        // Update participant, but using new comment thread
        val p = participantService.getParticipantById(pId)
        participantService.addThread(p, thread)
        return CommentThreadDtoFull(thread)
    }

    @PostMapping(path = ["/{pId}/labels/{labelId}"])
    fun addLabelMapping(@PathVariable pId: Long, @PathVariable labelId: Long): ParticipantDtoFull {
        val participant = participantService.getParticipantById(pId)
        val label = labelService.getLabelById(labelId)
        participantService.addLabel(participant, label)
        return ParticipantDtoFull(participant)
    }

    @DeleteMapping(path = ["/{pId}/labels/{labelId}"])
    fun deleteLabelMapping(@PathVariable pId: Long, @PathVariable labelId: Long): ParticipantDtoFull {
        val participant = participantService.getParticipantById(pId)
        val label = labelService.getLabelById(labelId)
        participantService.removeLabelMapping(participant, label)
        return ParticipantDtoFull(participant)
    }


}