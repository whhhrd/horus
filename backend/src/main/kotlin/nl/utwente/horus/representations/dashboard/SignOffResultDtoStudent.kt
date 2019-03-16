package nl.utwente.horus.representations.dashboard

import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType
import java.time.ZonedDateTime

class SignOffResultDtoStudent {
    val participantId: Long
    val assignmentId: Long
    val signerName: String
    val signedAt: ZonedDateTime
    val result: SignOffResultType

    constructor(participantId: Long, assignmentId: Long, signerName: String, signedAt: ZonedDateTime, result: SignOffResultType) {
        this.participantId = participantId
        this.assignmentId = assignmentId
        this.signerName = signerName
        this.signedAt = signedAt
        this.result = result
    }

    constructor(asr: SignOffResult) : this(asr.participant.id, asr.assignment.id,
            asr.signedBy.person.fullName, asr.signedAt, asr.result)
}