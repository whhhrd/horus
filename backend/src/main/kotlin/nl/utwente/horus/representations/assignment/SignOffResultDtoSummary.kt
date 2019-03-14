package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDtoFull
import java.time.ZonedDateTime

class SignOffResultDtoSummary {
    val participant: ParticipantDtoFull
    val signer: ParticipantDtoFull
    val signedAt: ZonedDateTime
    val commentThread: CommentThreadDtoBrief?
    val result: SignOffResultType
    val assignment: AssignmentDtoBrief

    constructor(participant: ParticipantDtoFull, signer: ParticipantDtoFull, signedAt: ZonedDateTime,
                commentThread: CommentThreadDtoBrief?, result: SignOffResultType, assignment: AssignmentDtoBrief) {
        this.participant = participant
        this.signer = signer
        this.signedAt = signedAt
        this.commentThread = commentThread
        this.result = result
        this.assignment = assignment
    }

    constructor(asr: SignOffResult) : this(ParticipantDtoFull(asr.participant),
            ParticipantDtoFull(asr.signedBy), asr.signedAt,
            asr.commentThread?.let { CommentThreadDtoBrief(it) }, asr.result,
            AssignmentDtoBrief(asr.assignment))
}