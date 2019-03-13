package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.Assignment
import nl.utwente.horus.representations.participant.ParticipantDtoBrief

class AssignmentDtoSummary : AssignmentDtoBrief {
    val assignmentSet : AssignmentSetDtoBrief
    val createdBy: ParticipantDtoBrief

    constructor(a: Assignment) : super(a) {
        this.assignmentSet = AssignmentSetDtoBrief(a.assignmentSet)
        this.createdBy = ParticipantDtoBrief(a.createdBy)
    }
}