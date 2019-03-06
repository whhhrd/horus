package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType

data class SignOffResultDtoCompact(
        val id: Long,
        val assignmentId: Long,
        val participantId: Long,
        val result: SignOffResultType,
        val commentThreadId: Long?
) {
    constructor(result: SignOffResult) : this(result.id, result.assignment.id, result.participant.id, result.result, result.commentThread?.id)
}
