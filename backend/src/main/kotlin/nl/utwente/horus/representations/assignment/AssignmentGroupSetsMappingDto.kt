package nl.utwente.horus.representations.assignment

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignmentgroupmapping.AssignmentGroupSetsMapping
import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.representations.group.GroupSetDtoBrief

open class AssignmentGroupSetsMappingDto {
    val assignmentSet: AssignmentSetDtoBrief
    val groupSet: GroupSetDtoBrief

    constructor(assignmentSet: AssignmentSet, groupSet: GroupSet) {
        this.assignmentSet = AssignmentSetDtoBrief(assignmentSet)
        this.groupSet = GroupSetDtoBrief(groupSet)
    }

    constructor(asgm: AssignmentGroupSetsMapping) : this(asgm.assignmentSet, asgm.groupSet)
}