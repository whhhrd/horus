package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSignOffResult
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDto
import java.time.ZonedDateTime

class SignOffResultDtoSummary {
    val participant: ParticipantDto
    val signer: ParticipantDto
    val signedAt: ZonedDateTime
    val commentThread: CommentThreadDtoBrief?
    val result: SignOffResult
    val assignment: AssignmentDtoBrief

    constructor(participant: ParticipantDto, signer: ParticipantDto, signedAt: ZonedDateTime,
                commentThread: CommentThreadDtoBrief?, result: SignOffResult, assignment: AssignmentDtoBrief) {
        this.participant = participant
        this.signer = signer
        this.signedAt = signedAt
        this.commentThread = commentThread
        this.result = result
        this.assignment = assignment
    }

    constructor(asr: AssignmentSignOffResult) : this(ParticipantDto(asr.participant),
            ParticipantDto(asr.participant), asr.signedAt,
            asr.commentThread?.let { CommentThreadDtoBrief(it) }, asr.result,
            AssignmentDtoBrief(asr.assignment))
}