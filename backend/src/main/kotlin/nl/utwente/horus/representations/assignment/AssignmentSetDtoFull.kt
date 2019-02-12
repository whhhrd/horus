package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSet

class AssignmentSetDtoFull : AssignmentSetDtoSummary {
    val assignments: MutableSet<AssignmentDtoBrief>

    constructor(assignmentSet: AssignmentSet) : super(assignmentSet) {
        this.assignments = assignmentSet.assignments.map { AssignmentDtoBrief(it) }.toMutableSet()
    }
}