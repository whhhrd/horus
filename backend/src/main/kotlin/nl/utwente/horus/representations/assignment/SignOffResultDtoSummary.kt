package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDtoBrief
import java.time.ZonedDateTime

class SignOffResultDtoSummary {
    val participant: ParticipantDtoBrief
    val signer: ParticipantDtoBrief
    val signedAt: ZonedDateTime
    val commentThread: CommentThreadDtoBrief?
    val result: SignOffResultType
    val assignment: AssignmentDtoBrief

    constructor(participant: ParticipantDtoBrief, signer: ParticipantDtoBrief, signedAt: ZonedDateTime,
                commentThread: CommentThreadDtoBrief?, result: SignOffResultType, assignment: AssignmentDtoBrief) {
        this.participant = participant
        this.signer = signer
        this.signedAt = signedAt
        this.commentThread = commentThread
        this.result = result
        this.assignment = assignment
    }

    constructor(asr: SignOffResult) : this(ParticipantDtoBrief(asr.participant),
            ParticipantDtoBrief(asr.signedBy), asr.signedAt,
            asr.commentThread?.let { CommentThreadDtoBrief(it) }, asr.result,
            AssignmentDtoBrief(asr.assignment))
}