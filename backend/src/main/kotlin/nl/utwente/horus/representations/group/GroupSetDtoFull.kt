package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.representations.assignment.AssignmentGroupSetsMappingDto

open class GroupSetDtoFull : GroupSetDtoSummary {
    val groups: MutableSet<GroupDtoBrief>
    val assignmentSetMappings: MutableSet<AssignmentGroupSetsMappingDto>

    constructor(gs: GroupSet) : super(gs) {
        this.groups = gs.groups.map { GroupDtoBrief(it) }.toMutableSet()
        this.assignmentSetMappings = gs.assignmentSetMappings
                .map { AssignmentGroupSetsMappingDto(it) }.toMutableSet()
    }
}