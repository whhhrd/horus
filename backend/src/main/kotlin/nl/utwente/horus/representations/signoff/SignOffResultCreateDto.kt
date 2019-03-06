package nl.utwente.horus.representations.signoff

import nl.utwente.horus.entities.assignment.SignOffResultType

data class SignOffResultCreateDto (
        val assignmentId: Long,
        val participantId: Long,
        val result: SignOffResultType,
        val comment: String?
)