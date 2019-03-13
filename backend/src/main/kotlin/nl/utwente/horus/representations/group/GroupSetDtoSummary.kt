package nl.utwente.horus.representations.group

import nl.utwente.horus.entities.group.GroupSet
import nl.utwente.horus.representations.course.CourseDtoBrief
import nl.utwente.horus.representations.person.PersonDtoBrief

open class GroupSetDtoSummary : GroupSetDtoBrief {
    val course: CourseDtoBrief
    val createdBy: PersonDtoBrief

    constructor(gs: GroupSet) : super(gs) {
        this.course = CourseDtoBrief(gs.course)
        this.createdBy = PersonDtoBrief(gs.createdBy.person)
    }
}