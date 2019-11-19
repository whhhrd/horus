package nl.utwente.horus.representations.course

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.representations.auth.RoleDtoBrief

open class CourseDtoSummary : CourseDtoBrief {
    val role: RoleDtoBrief
    val hidden: Boolean

    constructor(course: Course, role: RoleDtoBrief, hidden: Boolean) : super(course) {
        this.role = role
        this.hidden = hidden
    }
}