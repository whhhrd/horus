package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.representations.comment.CommentThreadDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDto

class AssignmentDtoSummary : AssignmentDtoBrief {
    val assignmentSet : AssignmentSetDtoBrief
    val commentThread: CommentThreadDtoBrief?
    val createdBy: ParticipantDto

    constructor(a: Assignment) : super(a) {
        this.assignmentSet = AssignmentSetDtoBrief(a.assignmentSet)
        this.commentThread = a.commentThread?.let { CommentThreadDtoBrief(it) }
        this.createdBy = ParticipantDto(a.createdBy)
    }
}