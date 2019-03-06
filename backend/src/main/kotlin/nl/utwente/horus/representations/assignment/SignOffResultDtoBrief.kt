package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.assignment.SignOffResultType
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief

class SignOffResultDtoBrief {
    val assignmentId: Long
    val participantId: Long
    val result: SignOffResultType
    val commentThread: CommentThreadDtoBrief?

    constructor(assignmentId: Long, participantId: Long, result: SignOffResultType, commentThread: CommentThreadDtoBrief?) {
        this.assignmentId = assignmentId
        this.participantId = participantId
        this.result = result
        this.commentThread = commentThread
    }

    constructor(result: SignOffResult) : this(result.assignment.id, result.participant.id,
            result.result, result.commentThread?.let { CommentThreadDtoBrief(it) })
}