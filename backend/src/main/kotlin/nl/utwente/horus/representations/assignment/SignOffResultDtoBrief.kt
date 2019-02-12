package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSignOffResult
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief

class SignOffResultDtoBrief {
    val assignmentId: Long
    val participantId: Long
    val result: SignOffResult
    val commentThread: CommentThreadDtoBrief?

    constructor(assignmentId: Long, participantId: Long, result: SignOffResult, commentThread: CommentThreadDtoBrief?) {
        this.assignmentId = assignmentId
        this.participantId = participantId
        this.result = result
        this.commentThread = commentThread
    }

    constructor(result: AssignmentSignOffResult) : this(result.assignment.id, result.participant.id,
            result.result, result.commentThread?.let { CommentThreadDtoBrief(it) })
}