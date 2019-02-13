package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSet

class AssignmentSetDtoFull : AssignmentSetDtoSummary {
    val assignments: MutableSet<AssignmentDtoBrief>
    val groupSetMappings: MutableSet<AssignmentGroupSetsMappingDto>

    constructor(assignmentSet: AssignmentSet) : super(assignmentSet) {
        this.assignments = assignmentSet.assignments.map { AssignmentDtoBrief(it) }.toMutableSet()
        this.groupSetMappings = assignmentSet.groupSetMappings
                .map { AssignmentGroupSetsMappingDto(it) }.toMutableSet()
    }
}