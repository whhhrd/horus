package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.representations.course.CourseDtoBrief
import nl.utwente.horus.representations.participant.ParticipantDto

open class AssignmentSetDtoSummary: AssignmentSetDtoBrief {
    val course: CourseDtoBrief
    val createdBy: ParticipantDto

    constructor(assignmentSet: AssignmentSet) : super(assignmentSet) {
        this.course = CourseDtoBrief(assignmentSet.course)
        this.createdBy = ParticipantDto(assignmentSet.createdBy)
    }
}