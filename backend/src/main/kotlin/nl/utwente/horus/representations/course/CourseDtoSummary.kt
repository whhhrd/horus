package nl.utwente.horus.representations.course

import nl.utwente.horus.entities.course.Course
import nl.utwente.horus.representations.auth.RoleDtoBrief

class CourseDtoSummary : CourseDtoBrief {
    val role: RoleDtoBrief

    constructor(course: Course, role: RoleDtoBrief) : super(course) {
        this.role = role
    }
}