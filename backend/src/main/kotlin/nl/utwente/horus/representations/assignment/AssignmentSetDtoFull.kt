package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSet

class AssignmentSetDtoFull : AssignmentSetDtoSummary {
    val assignments: List<AssignmentDtoBrief>
    val groupSetMappings: MutableSet<AssignmentGroupSetsMappingDto>

    constructor(assignmentSet: AssignmentSet) : super(assignmentSet) {
        // Might not be in order if used right after updating: re-order in case
        this.assignments = assignmentSet.assignments.sortedBy { it.orderKey }.map { AssignmentDtoBrief(it) }
        this.groupSetMappings = assignmentSet.groupSetMappings
                .map { AssignmentGroupSetsMappingDto(it) }.toMutableSet()
    }
}