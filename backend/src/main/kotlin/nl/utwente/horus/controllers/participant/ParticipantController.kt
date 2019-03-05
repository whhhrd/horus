package nl.utwente.horus.controllers.participant

import nl.utwente.horus.exceptions.CommentThreadNotFoundException
import nl.utwente.horus.representations.comment.CommentThreadCreateDto
import nl.utwente.horus.representations.comment.CommentThreadDtoFull
import nl.utwente.horus.services.auth.HorusUserDetailService
import nl.utwente.horus.services.comment.CommentService
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


}