package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSignOffResult
import nl.utwente.horus.entities.assignment.SignOffResult

class SignOffResultDtoCompact {
    val assignmentId: Long
    val participantId: Long
    val result: SignOffResult
    val commentThreadId: Long?

    constructor(a: Long, p: Long, r: SignOffResult, c: Long?) {
        this.assignmentId = a
        this.participantId = p
        this.result = r
        this.commentThreadId = c
    }

    constructor(result: AssignmentSignOffResult) {
        this.assignmentId = result.assignment.id
        this.participantId = result.participant.id
        this.result = result.result
        this.commentThreadId = result.commentThread?.id
    }

}