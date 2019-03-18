package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.representations.course.CourseDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDtoBrief

open class AssignmentSetDtoSummary: AssignmentSetDtoBrief {
    val course: CourseDtoBrief
    val createdBy: ParticipantDtoBrief

    constructor(assignmentSet: AssignmentSet) : super(assignmentSet) {
        this.course = CourseDtoBrief(assignmentSet.course)
        this.createdBy = ParticipantDtoBrief(assignmentSet.createdBy)
    }
}