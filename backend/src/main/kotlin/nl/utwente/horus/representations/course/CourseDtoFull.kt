package nl.utwente.horus.representations.course

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.representations.assignment.AssignmentSetDtoBrief
import nl.utwente.horus.representations.auth.RoleDtoBrief
import nl.utwente.horus.representations.group.GroupSetDtoBrief

class CourseDtoFull : CourseDtoSummary {
    val assignmentSets: MutableSet<AssignmentSetDtoBrief>
    val groupSets: MutableSet<GroupSetDtoBrief>

    constructor(course: Course, role: RoleDtoBrief) : super(course, role) {
        this.assignmentSets = course.assignmentSets.map { AssignmentSetDtoBrief(it) }.toMutableSet()
        this.groupSets = course.groupSets.map { GroupSetDtoBrief(it) }.toMutableSet()
    }




}