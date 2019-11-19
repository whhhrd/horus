package nl.utwente.horus.representations.course

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.representations.assignment.AssignmentSetDtoBrief
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.group.GroupSetDtoBrief
import nl.utwente.horus.representations.participant.LabelDto

class CourseDtoFull : CourseDtoSummary {
    val labels: List<LabelDto>
    val assignmentSets: List<AssignmentSetDtoBrief>
    val groupSets: List<GroupSetDtoBrief>

    constructor(course: Course, role: RoleDtoBrief, hidden: Boolean) : super(course, role, hidden) {
        this.labels = course.labels.map { LabelDto(it) }
        this.assignmentSets = course.assignmentSets.map { AssignmentSetDtoBrief(it) }
        this.groupSets = course.groupSets.map { GroupSetDtoBrief(it) }
    }




}