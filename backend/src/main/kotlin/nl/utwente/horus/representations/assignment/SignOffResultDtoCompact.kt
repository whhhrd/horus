package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType

class SignOffResultDtoCompact {
    val assignmentId: Long
    val participantId: Long
    val result: SignOffResultType
    val commentThreadId: Long?

    constructor(a: Long, p: Long, r: SignOffResultType, c: Long?) {
        this.assignmentId = a
        this.participantId = p
        this.result = r
        this.commentThreadId = c
    }

    constructor(result: SignOffResult) {
        this.assignmentId = result.assignment.id
        this.participantId = result.participant.id
        this.result = result.result
        this.commentThreadId = result.commentThread?.id
    }

}