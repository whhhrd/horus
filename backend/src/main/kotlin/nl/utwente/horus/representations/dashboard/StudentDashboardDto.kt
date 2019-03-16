package nl.utwente.horus.representations.dashboard

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.assignment.SignOffResult
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.representations.assignment.AssignmentSetDtoFull
import nl.utwente.horus.representations.assignment.SignOffResultDtoCompact
import nl.utwente.horus.representations.group.GroupDtoFull

class StudentDashboardDto {
        val groups: List<GroupDtoFull>
        val assignmentSets: List<AssignmentSetDtoFull>
        val results: List<SignOffResultDtoCompact>

    constructor(groups: List<Group>, assignmentSets: List<AssignmentSet>, results: List<SignOffResult>) {
        this.groups = groups.map { GroupDtoFull(it) }
        this.assignmentSets = assignmentSets.map { AssignmentSetDtoFull(it) }
        this.results = results.map { SignOffResultDtoCompact(it) }
    }
}