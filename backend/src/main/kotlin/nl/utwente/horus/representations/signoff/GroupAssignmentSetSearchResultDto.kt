package nl.utwente.horus.representations.signoff

import nl.utwente.horus.entities.assignment.AssignmentSet
import nl.utwente.horus.entities.group.Group
import nl.utwente.horus.representations.assignment.AssignmentSetDtoBrief
import nl.utwente.horus.representations.group.GroupDtoBrief
import nl.utwente.horus.representations.group.GroupDtoSearch

class GroupAssignmentSetSearchResultDto (
        val groups: List<GroupDtoSearch>,
        val assignmentSets: List<AssignmentSetDtoBrief>
)